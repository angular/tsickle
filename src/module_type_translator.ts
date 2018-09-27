/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @fileoverview module_type_translator builds on top of type_translator, adding functionality to
 * translate types within the scope of a single module. The main entry point is
 * ModuleTypeTranslator.
 */

import * as googmodule from './googmodule';
import * as jsdoc from './jsdoc';
import {AnnotatorHost, isAmbient} from './jsdoc_transformer';
import {createSingleQuoteStringLiteral, getIdentifierText, hasModifierFlag, reportDebugWarning, reportDiagnostic} from './transformer_util';
import * as typeTranslator from './type_translator';
import * as ts from './typescript';

/**
 * MutableJSDoc encapsulates a (potential) JSDoc comment on a specific node, and allows code to
 * modify (including delete) it.
 */
export class MutableJSDoc {
  constructor(
      private node: ts.Node, private sourceComment: ts.SynthesizedComment|null,
      public tags: jsdoc.Tag[]) {}

  updateComment(escapeExtraTags?: Set<string>) {
    const text = jsdoc.toStringWithoutStartEnd(this.tags, escapeExtraTags);
    if (this.sourceComment) {
      if (!text) {
        // Delete the (now empty) comment.
        const comments = ts.getSyntheticLeadingComments(this.node)!;
        const idx = comments.indexOf(this.sourceComment);
        comments.splice(idx, 1);
        this.sourceComment = null;
        return;
      }
      this.sourceComment.text = text;
      return;
    }

    // Don't add an empty comment.
    if (!text) return;

    const comment: ts.SynthesizedComment = {
      kind: ts.SyntaxKind.MultiLineCommentTrivia,
      text,
      hasTrailingNewLine: true,
      pos: -1,
      end: -1,
    };
    const comments = ts.getSyntheticLeadingComments(this.node) || [];
    comments.push(comment);
    ts.setSyntheticLeadingComments(this.node, comments);
  }
}

/** Returns the Closure name of a function parameter, special-casing destructuring. */
function getParameterName(param: ts.ParameterDeclaration, index: number): string {
  switch (param.name.kind) {
    case ts.SyntaxKind.Identifier:
      let name = getIdentifierText(param.name as ts.Identifier);
      // TypeScript allows parameters named "arguments", but Closure
      // disallows this, even in externs.
      if (name === 'arguments') name = 'tsickle_arguments';
      return name;
    case ts.SyntaxKind.ArrayBindingPattern:
    case ts.SyntaxKind.ObjectBindingPattern:
      // Closure crashes if you put a binding pattern in the externs.
      // Avoid this by just generating an unused name; the name is
      // ignored anyway.
      return `__${index}`;
    default:
      // The above list of kinds is exhaustive.  param.name is 'never' at this point.
      const paramName = param.name as ts.Node;
      throw new Error(`unhandled function parameter kind: ${ts.SyntaxKind[paramName.kind]}`);
  }
}

/**
 * ModuleTypeTranslator encapsulates knowledge and helper functions to translate types in the scope
 * of a specific module. This includes managing Closure forward declare statements and any symbol
 * aliases in scope for a whole file.
 */
export class ModuleTypeTranslator {
  /**
   * A mapping of aliases for symbols in the current file, used when emitting types. TypeScript
   * emits imported symbols with unpredictable prefixes. To generate correct type annotations,
   * tsickle creates its own aliases for types, and registers them in this map (see
   * `emitImportDeclaration` and `forwardDeclare()` below). The aliases are then used when emitting
   * types.
   */
  symbolsToAliasedNames = new Map<ts.Symbol, string>();

  /**
   * The set of module symbols forward declared in the local namespace (with goog.forwarDeclare).
   *
   * Symbols not imported must be declared, which is done by adding forward declares to
   * `extraImports` below.
   */
  private forwardDeclaredModules = new Set<ts.Symbol>();
  /**
   * The list of generated goog.forwardDeclare statements for this module. These are inserted into
   * the module's body statements after translation.
   */
  private forwardDeclares: ts.Statement[] = [];
  /** A counter to generate unique names for goog.forwardDeclare variables. */
  private forwardDeclareCounter = 0;

  constructor(
      public sourceFile: ts.SourceFile,
      public typeChecker: ts.TypeChecker,
      private host: AnnotatorHost,
      private diagnostics: ts.Diagnostic[],
      private isForExterns: boolean,
  ) {}

  debugWarn(context: ts.Node, messageText: string) {
    reportDebugWarning(this.host, context, messageText);
  }

  error(node: ts.Node, messageText: string) {
    reportDiagnostic(this.diagnostics, node, messageText);
  }

  /**
   * Convert a TypeScript ts.Type into the equivalent Closure type.
   *
   * @param context The ts.Node containing the type reference; used for resolving symbols
   *     in context.
   * @param type The type to translate; if not provided, the Node's type will be used.
   * @param resolveAlias If true, do not emit aliases as their symbol, but rather as the resolved
   *     type underlying the alias. This should be true only when emitting the typedef itself.
   */
  typeToClosure(context: ts.Node, type?: ts.Type): string {
    if (this.host.untyped) {
      return '?';
    }

    const typeChecker = this.typeChecker;
    if (!type) {
      type = typeChecker.getTypeAtLocation(context);
    }
    return this.newTypeTranslator(context).translate(type);
  }

  newTypeTranslator(context: ts.Node) {
    // In externs, there is no local scope, so all types must be relative to the file level scope.
    const translationContext = this.isForExterns ? this.sourceFile : context;

    const translator = new typeTranslator.TypeTranslator(
        this.host, this.typeChecker, translationContext, this.host.typeBlackListPaths,
        this.symbolsToAliasedNames, (sym: ts.Symbol) => this.ensureSymbolDeclared(sym));
    translator.isForExterns = this.isForExterns;
    translator.warn = msg => this.debugWarn(context, msg);
    return translator;
  }

  isBlackListed(context: ts.Node) {
    const type = this.typeChecker.getTypeAtLocation(context);
    let sym = type.symbol;
    if (!sym) return false;
    if (sym.flags & ts.SymbolFlags.Alias) {
      sym = this.typeChecker.getAliasedSymbol(sym);
    }
    return this.newTypeTranslator(context).isBlackListed(sym);
  }

  /**
   * Get the ts.Symbol at a location or throw.
   * The TypeScript API can return undefined when fetching a symbol, but in many contexts we know it
   * won't (e.g. our input is already type-checked).
   */
  mustGetSymbolAtLocation(node: ts.Node): ts.Symbol {
    const sym = this.typeChecker.getSymbolAtLocation(node);
    if (!sym) throw new Error('no symbol');
    return sym;
  }

  /** Finds an exported (i.e. not global) declaration for the given symbol. */
  protected findExportedDeclaration(sym: ts.Symbol): ts.Declaration|undefined {
    // TODO(martinprobst): it's unclear when a symbol wouldn't have a declaration, maybe just for
    // some builtins (e.g. Symbol)?
    if (!sym.declarations || sym.declarations.length === 0) return undefined;
    // A symbol declared in this file does not need to be imported.
    if (sym.declarations.some(d => d.getSourceFile() === this.sourceFile)) return undefined;

    // Find an exported declaration.
    // Because tsickle runs with the --declaration flag, all types referenced from exported types
    // must be exported, too, so there must either be some declaration that is exported, or the
    // symbol is actually a global declaration (declared in a script file, not a module).
    const decl = sym.declarations.find(d => {
      // Check for Export | Default (default being a default export).
      if (!hasModifierFlag(d, ts.ModifierFlags.ExportDefault)) return false;
      // Exclude symbols declared in `declare global {...}` blocks, they are global and don't need
      // imports.
      let current: ts.Node|undefined = d;
      while (current) {
        if (current.flags & ts.NodeFlags.GlobalAugmentation) return false;
        current = current.parent;
      }
      return true;
    });
    return decl;
  }

  /**
   * Returns the `const x = goog.forwardDeclare...` text for an import of the given `importPath`.
   * This also registers aliases for symbols from the module that map to this forward declare.
   */
  forwardDeclare(
      importPath: string, moduleSymbol: ts.Symbol, isExplicitImport: boolean,
      isDefaultImport = false) {
    if (this.host.untyped) return;
    // Already imported? Do not emit a duplicate forward declare.
    if (this.forwardDeclaredModules.has(moduleSymbol)) return;
    const nsImport = googmodule.extractGoogNamespaceImport(importPath);
    const forwardDeclarePrefix = `tsickle_forward_declare_${++this.forwardDeclareCounter}`;
    const moduleNamespace = nsImport !== null ?
        nsImport :
        this.host.pathToModuleName(this.sourceFile.fileName, importPath);

    // In TypeScript, importing a module for use in a type annotation does not cause a runtime load.
    // In Closure Compiler, goog.require'ing a module causes a runtime load, so emitting requires
    // here would cause a change in load order, which is observable (and can lead to errors).
    // Instead, goog.forwardDeclare types, which allows using them in type annotations without
    // causing a load. See below for the exception to the rule.
    // const forwardDeclarePrefix = goog.forwardDeclare(moduleNamespace)
    this.forwardDeclares.push(ts.createVariableStatement(
        undefined,
        ts.createVariableDeclarationList(
            [ts.createVariableDeclaration(
                forwardDeclarePrefix, undefined,
                ts.createCall(
                    ts.createPropertyAccess(ts.createIdentifier('goog'), 'forwardDeclare'),
                    undefined, [ts.createLiteral(moduleNamespace)]))],
            ts.NodeFlags.Const)));
    this.forwardDeclaredModules.add(moduleSymbol);
    const exports = this.typeChecker.getExportsOfModule(moduleSymbol).map(e => {
      if (e.flags & ts.SymbolFlags.Alias) {
        e = this.typeChecker.getAliasedSymbol(e);
      }
      return e;
    });
    const hasValues = exports.some(e => {
      const isValue = (e.flags & ts.SymbolFlags.Value) !== 0;
      const isConstEnum = (e.flags & ts.SymbolFlags.ConstEnum) !== 0;
      // const enums are inlined by TypeScript (if preserveConstEnums=false), so there is never a
      // value import generated for them. That means for the purpose of force-importing modules,
      // they do not count as values. If preserveConstEnums=true, this shouldn't hurt.
      return isValue && !isConstEnum;
    });
    if (isExplicitImport && !hasValues) {
      // Closure Compiler's toolchain will drop files that are never goog.require'd *before* type
      // checking (e.g. when using --closure_entry_point or similar tools). This causes errors
      // complaining about values not matching 'NoResolvedType', or modules not having a certain
      // member.
      // To fix, explicitly goog.require() modules that only export types. This should usually not
      // cause breakages due to load order (as no symbols are accessible from the module - though
      // contrived code could observe changes in side effects).
      // This is a heuristic - if the module exports some values, but those are never imported,
      // the file will still end up not being imported. Hopefully modules that export values are
      // imported for their value in some place.
      // goog.require("${moduleNamespace}");
      const hardRequire = ts.createStatement(ts.createCall(
          ts.createPropertyAccess(ts.createIdentifier('goog'), 'require'), undefined,
          [createSingleQuoteStringLiteral(moduleNamespace)]));
      const comment: ts.SynthesizedComment = {
        kind: ts.SyntaxKind.SingleLineCommentTrivia,
        text: ' force type-only module to be loaded',
        hasTrailingNewLine: true,
        pos: -1,
        end: -1,
      };
      ts.setSyntheticTrailingComments(hardRequire, [comment]);
      this.forwardDeclares.push(hardRequire);
    }
    for (const sym of exports) {
      // goog: imports don't actually use the .default property that TS thinks they have.
      const qualifiedName = nsImport && isDefaultImport ? forwardDeclarePrefix :
                                                          forwardDeclarePrefix + '.' + sym.name;
      this.symbolsToAliasedNames.set(sym, qualifiedName);
    }
  }

  protected ensureSymbolDeclared(sym: ts.Symbol) {
    const decl = this.findExportedDeclaration(sym);
    if (!decl) return;
    if (this.isForExterns) {
      this.error(decl, `declaration from module used in ambient type: ${sym.name}`);
      return;
    }

    // Actually import the symbol.
    const sourceFile = decl.getSourceFile();
    if (sourceFile === ts.getOriginalNode(this.sourceFile)) return;
    const moduleSymbol = this.typeChecker.getSymbolAtLocation(sourceFile);
    // A source file might not have a symbol if it's not a module (no ES6 im/exports).
    if (!moduleSymbol) return;
    // TODO(martinprobst): this should possibly use fileNameToModuleId.
    this.forwardDeclare(sourceFile.fileName, moduleSymbol, false);
  }

  insertForwardDeclares(sourceFile: ts.SourceFile) {
    let insertion = 0;
    // Skip over a leading file comment holder.
    if (sourceFile.statements.length &&
        sourceFile.statements[0].kind === ts.SyntaxKind.NotEmittedStatement) {
      insertion++;
    }
    return ts.updateSourceFileNode(sourceFile, [
      ...sourceFile.statements.slice(0, insertion),
      ...this.forwardDeclares,
      ...sourceFile.statements.slice(insertion),
    ]);
  }

  /**
   * Parses and synthesizes comments on node, and returns the JSDoc from it, if any.
   * @param reportWarnings if true, will report warnings from parsing the JSDoc. Set to false if
   *     this is not the "main" location dealing with a node to avoid duplicated warnings.
   */
  getJSDoc(node: ts.Node, reportWarnings: boolean): jsdoc.Tag[] {
    const [tags, ] = this.parseJSDoc(node, reportWarnings);
    return tags;
  }

  getMutableJSDoc(node: ts.Node): MutableJSDoc {
    const [tags, comment] = this.parseJSDoc(node, /* reportWarnings */ true);
    return new MutableJSDoc(node, comment, tags);
  }

  private parseJSDoc(node: ts.Node, reportWarnings: boolean):
      [jsdoc.Tag[], ts.SynthesizedComment|null] {
    // synthesizeLeadingComments below changes text locations for node, so extract the location here
    // in case it is needed later to report diagnostics.
    const start = node.getFullStart();
    const length = node.getLeadingTriviaWidth(this.sourceFile);

    const comments = jsdoc.synthesizeLeadingComments(node);
    if (!comments || comments.length === 0) return [[], null];

    for (let i = comments.length - 1; i >= 0; i--) {
      const comment = comments[i];
      const parsed = jsdoc.parse(comment);
      if (parsed) {
        if (reportWarnings && parsed.warnings) {
          const range = comment.originalRange || {pos: start, end: start + length};
          reportDiagnostic(
              this.diagnostics, node, parsed.warnings.join('\n'), range,
              ts.DiagnosticCategory.Warning);
        }
        return [parsed.tags, comment];
      }
    }
    return [[], null];
  }

  blacklistTypeParameters(
      context: ts.Node, decls: ReadonlyArray<ts.TypeParameterDeclaration>|undefined) {
    this.newTypeTranslator(context).blacklistTypeParameters(this.symbolsToAliasedNames, decls);
  }

  /**
   * Creates the jsdoc for methods, including overloads.
   * If overloaded, merges the signatures in the list of SignatureDeclarations into a single jsdoc.
   * - Total number of parameters will be the maximum count found across all variants.
   * - Different names at the same parameter index will be joined with "_or_"
   * - Variable args (...type[] in TypeScript) will be output as "...type",
   *    except if found at the same index as another argument.
   * @param fnDecls Pass > 1 declaration for overloads of same name
   * @return The list of parameter names that should be used to emit the actual
   *    function statement; for overloads, name will have been merged.
   */
  getFunctionTypeJSDoc(fnDecls: ts.SignatureDeclaration[], extraTags: jsdoc.Tag[] = []):
      {tags: jsdoc.Tag[], parameterNames: string[], thisReturnType: ts.Type|null} {
    const typeChecker = this.typeChecker;

    // De-duplicate tags and docs found for the fnDecls.
    const tagsByName = new Map<string, jsdoc.Tag>();
    function addTag(tag: jsdoc.Tag) {
      const existing = tagsByName.get(tag.tagName);
      tagsByName.set(tag.tagName, existing ? jsdoc.merge([existing, tag]) : tag);
    }
    for (const extraTag of extraTags) addTag(extraTag);

    const lens = fnDecls.map(fnDecl => fnDecl.parameters.length);
    const minArgsCount = Math.min(...lens);
    const maxArgsCount = Math.max(...lens);
    const isConstructor = fnDecls.find(d => d.kind === ts.SyntaxKind.Constructor) !== undefined;
    // For each parameter index i, paramTags[i] is an array of parameters
    // that can be found at index i.  E.g.
    //    function foo(x: string)
    //    function foo(y: number, z: string)
    // then paramTags[0] = [info about x, info about y].
    const paramTags: jsdoc.Tag[][] = [];
    const returnTags: jsdoc.Tag[] = [];
    const typeParameterNames = new Set<string>();

    let thisReturnType: ts.Type|null = null;
    for (const fnDecl of fnDecls) {
      // Construct the JSDoc comment by reading the existing JSDoc, if
      // any, and merging it with the known types of the function
      // parameters and return type.
      const tags = this.getJSDoc(fnDecl, /* reportWarnings */ false);

      // Copy all the tags other than @param/@return into the new
      // JSDoc without any change; @param/@return are handled specially.
      // TODO: there may be problems if an annotation doesn't apply to all overloads;
      // is it worth checking for this and erroring?
      for (const tag of tags) {
        if (tag.tagName === 'param' || tag.tagName === 'return') continue;
        addTag(tag);
      }

      // Add @abstract on "abstract" declarations.
      if (hasModifierFlag(fnDecl, ts.ModifierFlags.Abstract)) {
        addTag({tagName: 'abstract'});
      }

      // Add any @template tags.
      // Multiple declarations with the same template variable names should work:
      // the declarations get turned into union types, and Closure Compiler will need
      // to find a union where all type arguments are satisfied.
      if (fnDecl.typeParameters) {
        for (const tp of fnDecl.typeParameters) {
          typeParameterNames.add(getIdentifierText(tp.name));
        }
      }
      // Merge the parameters into a single list of merged names and list of types
      const sig = typeChecker.getSignatureFromDeclaration(fnDecl);
      if (!sig || !sig.declaration) throw new Error(`invalid signature ${fnDecl.name}`);
      if (sig.declaration.kind === ts.SyntaxKindJSDocSignature) {
        throw new Error(`JSDoc signature ${fnDecl.name}`);
      }
      for (let i = 0; i < sig.declaration.parameters.length; i++) {
        const paramNode = sig.declaration.parameters[i];

        const name = getParameterName(paramNode, i);
        const isThisParam = name === 'this';

        const newTag: jsdoc.Tag = {
          tagName: isThisParam ? 'this' : 'param',
          optional: paramNode.initializer !== undefined || paramNode.questionToken !== undefined,
          parameterName: isThisParam ? undefined : name,
        };

        let type = typeChecker.getTypeAtLocation(paramNode);
        if (paramNode.dotDotDotToken !== undefined) {
          newTag.restParam = true;
          // In TypeScript you write "...x: number[]", but in Closure
          // you don't write the array: "@param {...number} x".  Unwrap
          // the Array<> wrapper.
          const typeRef = type as ts.TypeReference;
          if (!typeRef.typeArguments) throw new Error('invalid rest param');
          type = typeRef.typeArguments![0];
        }
        newTag.type = this.typeToClosure(fnDecl, type);

        for (const {tagName, parameterName, text} of tags) {
          if (tagName === 'param' && parameterName === newTag.parameterName) {
            newTag.text = text;
            break;
          }
        }
        if (!paramTags[i]) paramTags.push([]);
        paramTags[i].push(newTag);
      }

      // Return type.
      if (!isConstructor) {
        const returnTag: jsdoc.Tag = {
          tagName: 'return',
        };
        const retType = typeChecker.getReturnTypeOfSignature(sig);
        // tslint:disable-next-line:no-any accessing TS internal field.
        if ((retType as any).isThisType) {
          // foo(): this
          thisReturnType = retType;
          addTag({tagName: 'template', text: 'THIS'});
          addTag({tagName: 'this', type: 'THIS'});
          returnTag.type = 'THIS';
        } else {
          returnTag.type = this.typeToClosure(fnDecl, retType);
          for (const {tagName, text} of tags) {
            if (tagName === 'return') {
              returnTag.text = text;
              break;
            }
          }
        }
        returnTags.push(returnTag);
      }
    }

    if (typeParameterNames.size > 0) {
      addTag({tagName: 'template', text: Array.from(typeParameterNames.values()).join(', ')});
    }

    const newDoc = Array.from(tagsByName.values());

    // Merge the JSDoc tags for each overloaded parameter.
    // Ensure each parameter has a unique name; the merging process can otherwise
    // accidentally generate the same parameter name twice.
    const paramNames = new Set();
    let foundOptional = false;
    for (let i = 0; i < maxArgsCount; i++) {
      const paramTag = jsdoc.merge(paramTags[i]);
      if (paramNames.has(paramTag.parameterName)) {
        paramTag.parameterName += i.toString();
      }
      paramNames.add(paramTag.parameterName);
      // If the tag is optional, mark parameters following optional as optional,
      // even if they are not, since Closure restricts this, see
      // https://github.com/google/closure-compiler/issues/2314
      if (!paramTag.restParam && (paramTag.optional || foundOptional || i >= minArgsCount)) {
        foundOptional = true;
        paramTag.optional = true;
      }
      newDoc.push(paramTag);
      if (paramTag.restParam) {
        // Cannot have any parameters after a rest param.
        // Just dump the remaining parameters.
        break;
      }
    }

    // Merge the JSDoc tags for each overloaded return.
    if (!isConstructor) {
      newDoc.push(jsdoc.merge(returnTags));
    }

    return {
      tags: newDoc,
      parameterNames: newDoc.filter(t => t.tagName === 'param').map(t => t.parameterName!),
      thisReturnType,
    };
  }
}
