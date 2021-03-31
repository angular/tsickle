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

import * as ts from 'typescript';

import {AnnotatorHost} from './annotator_host';
import * as googmodule from './googmodule';
import * as jsdoc from './jsdoc';
import {getIdentifierText, hasModifierFlag, reportDebugWarning, reportDiagnostic} from './transformer_util';
import * as typeTranslator from './type_translator';

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
 * of a specific module. This includes managing Closure requireType statements and any symbol
 * aliases in scope for a whole file.
 */
export class ModuleTypeTranslator {
  /**
   * A mapping of aliases for symbols in the current file, used when emitting types. TypeScript
   * emits imported symbols with unpredictable prefixes. To generate correct type annotations,
   * tsickle creates its own aliases for types, and registers them in this map (see
   * `emitImportDeclaration` and `requireType()` below). The aliases are then used when emitting
   * types.
   */
  symbolsToAliasedNames = new Map<ts.Symbol, string>();

  /**
   * A cache for expensive symbol lookups, see TypeTranslator.symbolToString. Maps symbols to their
   * Closure name in this file scope.
   */
  private symbolToNameCache = new Map<ts.Symbol, string>();

  /**
   * The set of module symbols requireTyped in the local namespace.  This tracks which imported
   * modules we've already added to additionalImports below.
   */
  private requireTypeModules = new Set<ts.Symbol>();

  /**
   * The list of generated goog.requireType statements for this module. These are inserted into
   * the module's body statements after translation.
   */
  private additionalImports: ts.Statement[] = [];

  constructor(
      public sourceFile: ts.SourceFile,
      public typeChecker: ts.TypeChecker,
      private host: AnnotatorHost,
      private diagnostics: ts.Diagnostic[],
      private isForExterns: boolean,
  ) {
    // TODO: remove once AnnotatorHost.typeBlackListPaths is removed.
    this.host.unknownTypesPaths = this.host.unknownTypesPaths ?? this.host.typeBlackListPaths;
  }

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
        this.host, this.typeChecker, translationContext, this.host.unknownTypesPaths || new Set(),
        this.symbolsToAliasedNames, this.symbolToNameCache,
        (sym: ts.Symbol) => this.ensureSymbolDeclared(sym));
    translator.isForExterns = this.isForExterns;
    translator.warn = msg => this.debugWarn(context, msg);
    return translator;
  }

  isAlwaysUnknownSymbol(context: ts.Node) {
    const type = this.typeChecker.getTypeAtLocation(context);
    let sym = type.symbol;
    if (!sym) return false;
    if (sym.flags & ts.SymbolFlags.Alias) {
      sym = this.typeChecker.getAliasedSymbol(sym);
    }
    return this.newTypeTranslator(context).isAlwaysUnknownSymbol(sym);
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
   * Generates a somewhat human-readable module prefix for the given import context, to make
   * debugging the emitted Closure types a bit easier.
   */
  private generateModulePrefix(importPath: string) {
    const modulePrefix = importPath.replace(/(\/index)?(\.d)?\.[tj]sx?$/, '')
                             .replace(/^.*[/.](.+?)/, '$1')
                             .replace(/\W/g, '_');
    return `tsickle_${modulePrefix || 'reqType'}_`;
  }

  /**
   * Records that we we want a `const x = goog.requireType...` import of the given `importPath`,
   * which will be inserted when we emit.
   * This also registers aliases for symbols from the module that map to this requireType.
   *
   * @param isDefaultImport True if the import statement is a default import, e.g.
   *     `import Foo from ...;`, which matters for adjusting whether we emit a `.default`.
   */
  requireType(context: ts.Node, importPath: string, moduleSymbol: ts.Symbol, isDefaultImport = false) {
    if (this.host.untyped) return;
    // Already imported? Do not emit a duplicate requireType.
    if (this.requireTypeModules.has(moduleSymbol)) return;
    if (typeTranslator.isAlwaysUnknownSymbol(this.host.unknownTypesPaths, moduleSymbol)) {
      return;  // Do not emit goog.requireType for paths marked as always unknown.
    }
    const nsImport =
        googmodule.namespaceForImportUrl(context, this.diagnostics, importPath, moduleSymbol);
    if (googmodule.extractModuleMarker(
            moduleSymbol, '__clutz_strip_property')) {
      // Symbols using import-by-path with strip property should be mapped to a
      // default import. This makes sure that type annotations get emitted as
      // "@type {module_alias}", not "@type {module_alias.TheStrippedName}".
      isDefaultImport = true;
    }
    const requireTypePrefix =
        this.generateModulePrefix(importPath) + String(this.requireTypeModules.size + 1);
    const moduleNamespace = nsImport !== null ?
        nsImport :
        this.host.pathToModuleName(this.sourceFile.fileName, importPath);

    // In TypeScript, importing a module for use in a type annotation does not cause a runtime load.
    // In Closure Compiler, goog.require'ing a module causes a runtime load, so emitting requires
    // here would cause a change in load order, which is observable (and can lead to errors).
    // Instead, goog.requireType types, which allows using them in type annotations without
    // causing a load.
    //   const requireTypePrefix = goog.requireType(moduleNamespace)
    this.additionalImports.push(ts.createVariableStatement(
        undefined,
        ts.createVariableDeclarationList(
            [ts.createVariableDeclaration(
                requireTypePrefix, undefined,
                ts.createCall(
                    ts.createPropertyAccess(ts.createIdentifier('goog'), 'requireType'), undefined,
                    [ts.createLiteral(moduleNamespace)]))],
            ts.NodeFlags.Const)));
    this.requireTypeModules.add(moduleSymbol);
    for (let sym of this.typeChecker.getExportsOfModule(moduleSymbol)) {
      // Some users import {default as SomeAlias} from 'goog:...';
      // The code below must recognize this as a default import to alias the symbol to just the
      // blank module name.
      const namedDefaultImport = sym.name === 'default';
      // goog: imports don't actually use the .default property that TS thinks they have.
      const qualifiedName = nsImport && (isDefaultImport || namedDefaultImport) ?
          requireTypePrefix :
          requireTypePrefix + '.' + sym.name;
      if (sym.flags & ts.SymbolFlags.Alias) {
        sym = this.typeChecker.getAliasedSymbol(sym);
      }
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
    this.requireType(decl, sourceFile.fileName, moduleSymbol);
  }

  insertAdditionalImports(sourceFile: ts.SourceFile) {
    let insertion = 0;
    // Skip over a leading file comment holder.
    if (sourceFile.statements.length &&
        sourceFile.statements[0].kind === ts.SyntaxKind.NotEmittedStatement) {
      insertion++;
    }
    return ts.updateSourceFileNode(sourceFile, [
      ...sourceFile.statements.slice(0, insertion),
      ...this.additionalImports,
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

  /**
   * resolveRestParameterType resolves the array member type for a rest parameter ("...").
   * In TypeScript you write "...x: number[]", but in Closure you don't write the array:
   * `@param {...number} x`. The code below unwraps the Array<> wrapper.
   */
  private resolveRestParameterType(
      newTag: jsdoc.Tag, fnDecl: ts.SignatureDeclaration,
      paramNode: ts.ParameterDeclaration) {
    const type = typeTranslator.restParameterType(
        this.typeChecker, this.typeChecker.getTypeAtLocation(paramNode));
    newTag.restParam = true;
    if (!type) {
      // If we fail to unwrap the Array<> type, emit an unknown type.
      this.debugWarn(
          paramNode, 'failed to resolve rest parameter type, emitting ?');
      newTag.type = '?';
      return;
    }
    newTag.type = this.typeToClosure(fnDecl, type);
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

    const isConstructor = fnDecls.find(d => d.kind === ts.SyntaxKind.Constructor) !== undefined;
    // For each parameter index i, paramTags[i] is an array of parameters
    // that can be found at index i.  E.g.
    //    function foo(x: string)
    //    function foo(y: number, z: string)
    // then paramTags[0] = [info about x, info about y].
    const paramTags: jsdoc.Tag[][] = [];
    const returnTags: jsdoc.Tag[] = [];
    const thisTags: jsdoc.Tag[] = [];
    const typeParameterNames = new Set<string>();

    const argCounts = [];
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

      const flags = ts.getCombinedModifierFlags(fnDecl);
      // Add @abstract on "abstract" declarations.
      if (flags & ts.ModifierFlags.Abstract) {
        addTag({tagName: 'abstract'});
      }
      // Add @protected/@private if present.
      if (flags & ts.ModifierFlags.Protected) {
        addTag({tagName: 'protected'});
      } else if (flags & ts.ModifierFlags.Private) {
        addTag({tagName: 'private'});
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
      if (sig.declaration.kind === ts.SyntaxKind.JSDocSignature) {
        throw new Error(`JSDoc signature ${fnDecl.name}`);
      }
      let hasThisParam = false;
      for (let i = 0; i < sig.declaration.parameters.length; i++) {
        const paramNode = sig.declaration.parameters[i];

        const name = getParameterName(paramNode, i);
        const isThisParam = name === 'this';
        if (isThisParam) hasThisParam = true;

        const newTag: jsdoc.Tag = {
          tagName: isThisParam ? 'this' : 'param',
          optional: paramNode.initializer !== undefined || paramNode.questionToken !== undefined,
          parameterName: isThisParam ? undefined : name,
        };

        if (paramNode.dotDotDotToken === undefined) {
          // The simple case: a plain parameter type.
          newTag.type = this.typeToClosure(fnDecl, this.typeChecker.getTypeAtLocation(paramNode));
        } else {
          // The complex case: resolve the array member type in ...foo[].
          this.resolveRestParameterType(newTag, fnDecl, paramNode);
        }

        for (const {tagName, parameterName, text} of tags) {
          if (tagName === 'param' && parameterName === newTag.parameterName) {
            newTag.text = text;
            break;
          }
        }
        if (!isThisParam) {
          const paramIdx = hasThisParam ? i - 1 : i;
          if (!paramTags[paramIdx]) paramTags.push([]);
          paramTags[paramIdx].push(newTag);
        } else {
          thisTags.push(newTag);
        }
      }
      argCounts.push(
          hasThisParam ? sig.declaration.parameters.length - 1 : sig.declaration.parameters.length);

      // Return type.
      if (!isConstructor) {
        const returnTag: jsdoc.Tag = {
          tagName: 'return',
        };
        const retType = typeChecker.getReturnTypeOfSignature(sig);
        // Generate a templated `@this` tag for TypeScript `foo(): this` return type specification.
        // Make sure not to do that if the function already has used `@this` due to a this
        // parameter. It's not clear how to resolve the two conflicting this types best, the current
        // solution prefers the explicitly given `this` parameter.
        // tslint:disable-next-line:no-any accessing TS internal field.
        if ((retType as any)['isThisType'] && !hasThisParam) {
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

    if (thisTags.length > 0) {
      newDoc.push(jsdoc.merge(thisTags));
    }

    const minArgsCount = Math.min(...argCounts);
    const maxArgsCount = Math.max(...argCounts);

    // Merge the JSDoc tags for each overloaded parameter.
    // Ensure each parameter has a unique name; the merging process can otherwise
    // accidentally generate the same parameter name twice.
    const paramNames = new Set<string>();
    let foundOptional = false;
    for (let i = 0; i < maxArgsCount; i++) {
      const paramTag = jsdoc.merge(paramTags[i]);
      if (paramTag.parameterName) {
        if (paramNames.has(paramTag.parameterName)) {
          paramTag.parameterName += i.toString();
        }
        paramNames.add(paramTag.parameterName);
      }
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
