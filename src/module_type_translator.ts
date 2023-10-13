/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @fileoverview module_type_translator builds on top of type_translator, adding
 * functionality to translate types within the scope of a single module. The
 * main entry point is ModuleTypeTranslator.
 */

import * as ts from 'typescript';

import {AnnotatorHost, moduleNameAsIdentifier} from './annotator_host';
import * as googmodule from './googmodule';
import * as jsdoc from './jsdoc';
import {getIdentifierText, hasModifierFlag, reportDebugWarning, reportDiagnostic} from './transformer_util';
import * as typeTranslator from './type_translator';

/**
 * ts.Symbol to access internal .parent property.
 */
declare interface SymbolWithParent extends ts.Symbol {
  parent?: SymbolWithParent;
}

function getDefinedModule(symbol: SymbolWithParent|undefined): ts.Symbol|
    undefined {
  while (symbol) {
    if (symbol.flags & ts.SymbolFlags.Module) {
      return symbol;
    }
    symbol = symbol.parent;
  }
  return undefined;
}

/**
 * Returns the Closure name of a function parameter, special-casing
 * destructuring.
 */
function getParameterName(
    param: ts.ParameterDeclaration, index: number): string {
  switch (param.name.kind) {
    case ts.SyntaxKind.Identifier:
      let name = getIdentifierText(param.name);
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
      // The above list of kinds is exhaustive.  param.name is 'never' at this
      // point.
      const paramName = param.name as ts.Node;
      throw new Error(`unhandled function parameter kind: ${
          ts.SyntaxKind[paramName.kind]}`);
  }
}

/**
 * ModuleTypeTranslator encapsulates knowledge and helper functions to translate
 * types in the scope of a specific module. This includes managing Closure
 * requireType statements and any symbol aliases in scope for a whole file.
 */
export class ModuleTypeTranslator {
  /**
   * A mapping of aliases for symbols in the current file, used when emitting
   * types. TypeScript emits imported symbols with unpredictable prefixes. To
   * generate correct type annotations, tsickle creates its own aliases for
   * types, and registers them in this map (see `emitImportDeclaration` and
   * `requireType()` below). The aliases are then used when emitting types.
   */
  symbolsToAliasedNames = new Map<ts.Symbol, string>();

  /**
   * A cache for expensive symbol lookups, see TypeTranslator.symbolToString.
   * Maps symbols to their Closure name in this file scope.
   */
  private readonly symbolToNameCache = new Map<ts.Symbol, string>();

  /**
   * The set of module symbols requireTyped in the local namespace.  This tracks
   * which imported modules we've already added to additionalImports below.
   */
  private readonly requireTypeModules = new Set<ts.Symbol>();

  /**
   * The list of generated goog.requireType statements for this module. These
   * are inserted into the module's body statements after translation.
   */
  private readonly additionalImports: ts.Statement[] = [];

  constructor(
      readonly sourceFile: ts.SourceFile,
      readonly typeChecker: ts.TypeChecker,
      private readonly host: AnnotatorHost&googmodule.GoogModuleProcessorHost,
      private readonly diagnostics: ts.Diagnostic[],
      private readonly isForExterns: boolean,
      private readonly useInternalNamespaceForExterns = false,
  ) {
    // TODO: remove once AnnotatorHost.typeBlackListPaths is removed.
    this.host.unknownTypesPaths =
        // tslint:disable-next-line:deprecation
        this.host.unknownTypesPaths ?? this.host.typeBlackListPaths;
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
   * @param context The ts.Node containing the type reference; used for
   *     resolving symbols in context.
   * @param type The type to translate; if not provided, the Node's type will be
   *     used.
   */
  typeToClosure(context: ts.Node, type?: ts.Type): string {
    if (this.host.untyped) {
      return '?';
    }
    // getOriginalNode(decl) is required because the type checker cannot type
    // check synthesized nodes.
    context = ts.getOriginalNode(context);
    const typeChecker = this.typeChecker;
    if (!type) {
      type = typeChecker.getTypeAtLocation(context);
    }
    try {
      return this.newTypeTranslator(context).translate(type);
    } catch (e: unknown) {
      if (!(e instanceof Error)) throw e;  // should not happen (tm)
      const sourceFile = context.getSourceFile();
      const {line, character} = context.pos !== -1 ?
          sourceFile.getLineAndCharacterOfPosition(context.pos) :
          {line: 0, character: 0};
      e.message = `internal error converting type at ${sourceFile.fileName}:${
                      line}:${character}:\n\n` +
          e.message;
      throw e;
    }
  }

  newTypeTranslator(context: ts.Node) {
    // In externs, there is no local scope, so all types must be relative to the
    // file level scope.
    const translationContext = this.isForExterns ? this.sourceFile : context;

    const translator = new typeTranslator.TypeTranslator(
        this.host, this.typeChecker, translationContext,
        this.host.unknownTypesPaths || new Set(), this.symbolsToAliasedNames,
        this.symbolToNameCache,
        (sym: ts.Symbol) => void this.ensureSymbolDeclared(sym));
    translator.isForExterns = this.isForExterns;
    translator.useInternalNamespaceForExterns =
        this.useInternalNamespaceForExterns;
    translator.warn = msg => void this.debugWarn(context, msg);
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
   * The TypeScript API can return undefined when fetching a symbol, but in many
   * contexts we know it won't (e.g. our input is already type-checked).
   */
  mustGetSymbolAtLocation(node: ts.Node): ts.Symbol {
    const sym = this.typeChecker.getSymbolAtLocation(node);
    if (!sym) throw new Error('no symbol');
    return sym;
  }

  /**
   * If the given declaration is an ES module export, returns true and adds a
   * goog.requireType alias for it in the current file. Otherwise returns false.
   */
  private addRequireTypeIfIsExported(decl: ts.Declaration, sym: ts.Symbol):
      boolean {
    // Check for Export | Default (default being a default export).
    if (!hasModifierFlag(decl, ts.ModifierFlags.ExportDefault)) return false;
    // Symbols declared in `declare global {...}` blocks are global and don't
    // need imports.
    if (isGlobalAugmentation(decl)) return false;

    const sourceFile = decl.getSourceFile();
    const moduleSymbol = this.typeChecker.getSymbolAtLocation(sourceFile);
    // A source file might not have a symbol if it's not a module (no ES6
    // im/exports). Here's an example of declarations that match the
    // 'ts.ModifierFlags.ExportDefault' modifier but are not ES6 exports:
    //   `declare namespace A.B { export class C {}; }`
    // Not only does 'export class C {}' match ts.ModifierFlags.Export,
    // but the namespace declarations for A and B also have the 'Export'
    // modifier.
    if (!moduleSymbol) {
      return false;
    }

    if (this.isForExterns) {
      this.error(
          decl, `declaration from module used in ambient type: ${sym.name}`);
    } else if (
        sourceFile.isDeclarationFile &&
        !sourceFile.text.match(/^\/\/!! generated by (clutz|tsickle|clutz2)/)) {
      this.registerExternSymbolAliases(sourceFile.fileName, moduleSymbol);
    } else {
      // Actually import the symbol.
      // TODO(martinprobst): this should possibly use fileNameToModuleId.
      this.requireType(decl, sourceFile.fileName, moduleSymbol);
    }
    return true;
  }

  /**
   * Generates a somewhat human-readable module prefix for the given import
   * context, to make debugging the emitted Closure types a bit easier.
   */
  private generateModulePrefix(importPath: string) {
    const modulePrefix = importPath.replace(/(\/index)?(\.d)?\.[tj]sx?$/, '')
                             .replace(/^.*[/.](.+?)/, '$1')
                             .replace(/\W/g, '_');
    return `tsickle_${modulePrefix || 'reqType'}_`;
  }

  /**
   * Records that we we want a `const x = goog.requireType...` import of the
   * given `importPath`, which will be inserted when we emit. This also
   * registers aliases for symbols from the module that map to this requireType.
   *
   * @param isDefaultImport True if the import statement is a default import,
   *     e.g. `import Foo from ...;`, which matters for adjusting whether we
   *     emit a `.default`.
   */
  requireType(
      context: ts.Node, importPath: string, moduleSymbol: ts.Symbol,
      isDefaultImport = false) {
    if (this.host.untyped) return;
    // Already imported? Do not emit a duplicate requireType.
    if (this.requireTypeModules.has(moduleSymbol)) return;
    if (typeTranslator.isAlwaysUnknownSymbol(
            this.host.unknownTypesPaths, moduleSymbol)) {
      return;  // Do not emit goog.requireType for paths marked as always
               // unknown.
    }
    const nsImport = googmodule.jsPathToNamespace(
        this.host, context, this.diagnostics, importPath, () => moduleSymbol);
    const requireTypePrefix = this.generateModulePrefix(importPath) +
        String(this.requireTypeModules.size + 1);
    const moduleNamespace = nsImport != null ?
        nsImport :
        this.host.pathToModuleName(this.sourceFile.fileName, importPath);
    if (googmodule.jsPathToStripProperty(
            this.host, importPath, () => moduleSymbol)) {
      // Symbols using import-by-path with strip property should be mapped to a
      // default import. This makes sure that type annotations get emitted as
      // "@type {module_alias}", not "@type {module_alias.TheStrippedName}".
      isDefaultImport = true;
    }

    // In TypeScript, importing a module for use in a type annotation does not
    // cause a runtime load. In Closure Compiler, goog.require'ing a module
    // causes a runtime load, so emitting requires here would cause a change in
    // load order, which is observable (and can lead to errors). Instead,
    // goog.requireType types, which allows using them in type annotations
    // without causing a load.
    //   const requireTypePrefix = goog.requireType(moduleNamespace)
    this.additionalImports.push(ts.factory.createVariableStatement(
        undefined,
        ts.factory.createVariableDeclarationList(
            [ts.factory.createVariableDeclaration(
                requireTypePrefix, /* exclamationToken */ undefined,
                /* type */ undefined,
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier('goog'), 'requireType'),
                    undefined,
                    [ts.factory.createStringLiteral(moduleNamespace)]))],
            ts.NodeFlags.Const)));
    this.requireTypeModules.add(moduleSymbol);

    this.registerImportSymbolAliases(
        nsImport, isDefaultImport, moduleSymbol, () => requireTypePrefix);
    this.registerImportTypeSymbolAliases(
        nsImport, isDefaultImport, moduleSymbol, requireTypePrefix);
  }

  /**
   * Get qualified name of a symbol by navigating through its parents.
   */
  private qualifiedNameFromSymbolChain(
      leafSymbol: SymbolWithParent,
      googNamespace: string|undefined,
      isDefaultImport: boolean,
      aliasPrefix: string,
      namedDefaultImport: boolean,
      ): string {
    if (googNamespace && (isDefaultImport || namedDefaultImport)) {
      return aliasPrefix;
    }
    let typeSymbol = leafSymbol;
    const symbols: SymbolWithParent[] = [typeSymbol];
    // Here we first try to cover cases which the ts file uses namespaces
    // itself. For those cases it is not enough just to append the symbol name
    // to the aliasPrefix, because we actually need to know the namespace
    // hierarchy and properly append that to the requireType-ed symbol.
    while (typeSymbol.parent &&
           typeSymbol.parent.flags & ts.SymbolFlags.NamespaceModule) {
      typeSymbol = typeSymbol.parent;
      symbols.push(typeSymbol);
    }
    let qualifiedName = '';
    let aliasResolved = false;
    for (const symbol of symbols.reverse()) {
      const alias = this.symbolsToAliasedNames.get(symbol);
      // For modules which use goog.provide and thus have additional namespace
      // hierarchy in the code, we try to resolve them by looking up
      // symbol-to-aliases so that we properly recognize which part of the
      // namespace corresponds to which qualified name.
      if (alias) {
        qualifiedName = alias;
        aliasResolved = true;
        continue;
      }
      qualifiedName =
          qualifiedName ? qualifiedName + '.' + symbol.name : symbol.name;
    }
    // parent being undefined indicates that this type is the global scope,
    // thus no need of alias prefix from `requireType`s.
    if (!aliasResolved && leafSymbol.parent) {
      qualifiedName = aliasPrefix + '.' + qualifiedName;
    }
    return qualifiedName.replace('ಠ_ಠ.clutz.', '');
  }

  /**
   * Registers string representation of all exported type symbols from the
   * existing `requireType`-ed module as a cache so that later we don't have to
   * do the eager lookup of type through symbol tables to construct the
   * qualifiedName. This is particularly useful because
   * ts.typeChecker.symbolToEntityName is pretty expensive.
   *
   * The danger in this code is that it is depending on internal ts.Symbol
   * properties.
   *
   * This function looks very similar to registerImportSymbolAliases but cannot
   * be merged due to registerImportAliases being called while generating
   * externs. Externs are generated while navigating all files, but string
   * representation of types differs from file to file, so we simply cannot
   * reuse the results, because it will start to break builds.
   */
  private registerImportTypeSymbolAliases(
      googNamespace: string|undefined, isDefaultImport: boolean,
      moduleSymbol: ts.Symbol, aliasPrefix: string) {
    for (let sym of this.typeChecker.getExportsOfModule(moduleSymbol) as
         SymbolWithParent[]) {
      // Some users import {default as SomeAlias} from 'goog:...';
      // The code below must recognize this as a default import to alias the
      // symbol to just the blank module name.
      const namedDefaultImport = sym.name === 'default';

      if (sym.flags & ts.SymbolFlags.Alias) {
        sym = this.typeChecker.getAliasedSymbol(sym);
      }
      // We only put into the cache when it's a class or an interface, because
      // more complex types (e.g. union) don't map to a single Symbol and
      // for other simple types it doesn't take much time to generate a string.
      const typeSymbol: SymbolWithParent|undefined =
          this.getTypeSymbolOfSymbolIfClassOrInterface(sym);
      if (!typeSymbol) continue;
      // In case the type is defined in a different file from the requireType-ed
      // module, indicating that this is a type alias and thus will either be
      // covered by other requireType statements, or should have been defined
      // in the immediate file itself.
      if (typeSymbol.parent &&
          getDefinedModule(sym) !== getDefinedModule(typeSymbol)) {
        continue;
      }
      const qualifiedName = this.qualifiedNameFromSymbolChain(
          typeSymbol,
          googNamespace,
          isDefaultImport,
          aliasPrefix,
          namedDefaultImport,
      );
      const cache = this.symbolToNameCache.get(typeSymbol);
      // Put in shorter symbols, as a proxy of prefering non-aliases.
      if (!cache || cache.length > qualifiedName.length) {
        this.symbolToNameCache.set(typeSymbol, qualifiedName);
      }
    }
  }

  /**
   * Returns the symbol of the type for the given symbol, if the type is a class
   * or an interface.
   */
  private getTypeSymbolOfSymbolIfClassOrInterface(symbol: ts.Symbol): ts.Symbol
      |undefined {
    const type = this.typeChecker.getDeclaredTypeOfSymbol(symbol);
    const typeSymbol = type.getSymbol();
    if (!typeSymbol) {
      return undefined;
    }
    if (!(type.flags & ts.TypeFlags.Object)) {
      return undefined;
    }
    const objectFlags = (type as ts.ObjectType).objectFlags;
    return objectFlags & ts.ObjectFlags.ClassOrInterface ? typeSymbol :
                                                           undefined;
  }

  /**
   * Registers aliases for the given import.
   *
   * @param googNamespace The goog: namespace as returned from
   *     googmodule.namespaceForImportUrl.
   * @param isDefaultImport True if the import statement is a default import,
   *     e.g. `import Foo from ...;`, which matters for adjusting whether we
   *     emit a `.default`.
   * @param moduleSymbol Symbol of the imported module, e.g. as returned from
   *     typeChecker.getSymbolAtLocation(importDeclaration.moduleSpecifier).
   * @param getAliasPrefix Should return the alias prefix. Called for each
   *     exported symbol. The registered alias is <aliasPrefix>.<exportedName>.
   */
  registerImportSymbolAliases(
      googNamespace: string|undefined, isDefaultImport: boolean,
      moduleSymbol: ts.Symbol, getAliasPrefix: (symbol: ts.Symbol) => string) {
    for (let sym of this.typeChecker.getExportsOfModule(moduleSymbol)) {
      const aliasPrefix = getAliasPrefix(sym);
      // Some users import {default as SomeAlias} from 'goog:...';
      // The code below must recognize this as a default import to alias the
      // symbol to just the blank module name.
      const namedDefaultImport = sym.name === 'default';
      // goog: imports don't actually use the .default property that TS thinks
      // they have.
      const qualifiedName =
          googNamespace && (isDefaultImport || namedDefaultImport) ?
          aliasPrefix :
          aliasPrefix + '.' + sym.name;
      if (sym.flags & ts.SymbolFlags.Alias) {
        sym = this.typeChecker.getAliasedSymbol(sym);
      }
      this.symbolsToAliasedNames.set(sym, qualifiedName);
    }
  }

  /**
   * Registers aliases for the symbol to the symbol name that will be written
   * into the (tsickle-generated) externs file for the symbol.  Because we rely
   * on the externs file existing, only call this function for literal,
   * user-supplied `.d.ts` files.
   */
  registerExternSymbolAliases(importPath: string, moduleSymbol: ts.Symbol) {
    const moduleNamespace =
        moduleNameAsIdentifier(this.host, importPath, this.sourceFile.fileName);
    for (let sym of this.typeChecker.getExportsOfModule(moduleSymbol)) {
      // Some users import {default as SomeAlias} from 'goog:...';
      // The code below must recognize this as a default import to alias the
      // symbol to just the blank module name.
      const namedDefaultImport = sym.name === 'default';
      // goog: imports don't actually use the .default property that TS thinks
      // they have.
      let qualifiedName: string;
      if (moduleNamespace) {
        if (namedDefaultImport) {
          qualifiedName = moduleNamespace;
        } else {
          qualifiedName = moduleNamespace + '.' + sym.name;
        }
      } else {
        qualifiedName = sym.name;
      }
      if (sym.flags & ts.SymbolFlags.Alias) {
        sym = this.typeChecker.getAliasedSymbol(sym);
      }
      this.symbolsToAliasedNames.set(sym, qualifiedName);
    }
  }

  protected ensureSymbolDeclared(sym: ts.Symbol) {
    // Early exit if we already have a local alias.
    // This also prevents "ensureSymbolDeclared" from clobbering local aliases
    // set up for imports.
    if (this.symbolsToAliasedNames.has(sym)) return;

    // Unlike what typescript is reasoning with symbol types, in this call path
    // it always seems that symbol has at least one type declaration.
    const declarations = sym.declarations!;
    // A symbol declared in this file does not need to be imported.
    const thisSourceFile = ts.getOriginalNode(this.sourceFile);
    if (declarations.some(d => d.getSourceFile() === thisSourceFile)) {
      return;
    }

    // If any declarations of this symbol are ES module exports, simply add a
    // goog.requireType to ensure this symbol is declared.
    for (const decl of declarations) {
      if (this.addRequireTypeIfIsExported(decl, sym)) return;
    }

    // We failed to find any actual ES module exports above, so try special case
    // processing for symbols declared by Clutz.
    // As we artificially strip Clutz internal namespace prefix ('ಠ_ಠ.clutz.')
    // from the symbol name, the TypeScript resolution doesn't match our
    // needs. Instead, we have to find an alias exported within a module.
    const clutzDecl = declarations.find(typeTranslator.isDeclaredInClutzDts);
    if (!clutzDecl) return;

    const clutzDts = clutzDecl.getSourceFile();
    const clutzModule =
        this.typeChecker.getSymbolsInScope(clutzDts, ts.SymbolFlags.Module)
            .find(
                (module: ts.Symbol) => module.getName().startsWith('"goog:') &&
                    module.valueDeclaration?.getSourceFile() === clutzDts &&
                    this.typeChecker.getExportsOfModule(module).some(
                        (exported: ts.Symbol) => {
                          if (exported.flags & ts.SymbolFlags.Alias) {
                            exported =
                                this.typeChecker.getAliasedSymbol(exported);
                          }
                          if (exported === sym) {
                            return true;
                          }
                          // In case the symbol is coming from a default export,
                          // we need to navigate through the child of the
                          // default nested to compare the symbol.
                          if (exported.exports) {
                            let found = false;
                            exported.exports.forEach((symbol, key) => {
                              found = found || symbol === sym;
                            });
                            return found;
                          }
                          return false;
                        }));
    if (clutzModule) {
      this.requireType(
          clutzDecl, clutzModule.getName().slice(1, -1), clutzModule);
    }
  }

  insertAdditionalImports(sourceFile: ts.SourceFile) {
    let insertion = 0;
    // Skip over a leading file comment holder.
    if (sourceFile.statements.length &&
        sourceFile.statements[0].kind === ts.SyntaxKind.NotEmittedStatement) {
      insertion++;
    }
    return ts.factory.updateSourceFile(sourceFile, [
      ...sourceFile.statements.slice(0, insertion),
      ...this.additionalImports,
      ...sourceFile.statements.slice(insertion),
    ]);
  }

  /**
   * Parses and synthesizes comments on node, and returns the JSDoc from it, if
   * any.
   * @param reportWarnings if true, will report warnings from parsing the JSDoc.
   *     Set to false if this is not the "main" location dealing with a node to
   *     avoid duplicated warnings.
   */
  getJSDoc(node: ts.Node, reportWarnings: boolean): jsdoc.Tag[] {
    return jsdoc.getJSDocTags(
        node, reportWarnings ? this.diagnostics : undefined, this.sourceFile);
  }

  getMutableJSDoc(node: ts.Node): jsdoc.MutableJSDoc {
    return jsdoc.getMutableJSDoc(node, this.diagnostics, this.sourceFile);
  }

  /**
   * resolveRestParameterType resolves the array member type for a rest
   * parameter ("..."). In TypeScript you write "...x: number[]", but in Closure
   * you don't write the array:
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
   * If overloaded, merges the signatures in the list of SignatureDeclarations
   * into a single jsdoc.
   * - Total number of parameters will be the maximum count found across all
   * variants.
   * - Different names at the same parameter index will be joined with "_or_"
   * - Variable args (...type[] in TypeScript) will be output as "...type",
   *    except if found at the same index as another argument.
   * @param fnDecls Pass > 1 declaration for overloads of same name
   * @return The list of parameter names that should be used to emit the actual
   *    function statement; for overloads, name will have been merged.
   */
  getFunctionTypeJSDoc(
      fnDecls: ts.SignatureDeclaration[], extraTags: jsdoc.Tag[] = []): {
    tags: jsdoc.Tag[],
    parameterNames: string[],
    thisReturnType: ts.Type|null
  } {
    const typeChecker = this.typeChecker;

    // De-duplicate tags and docs found for the fnDecls.
    const tagsByName = new Map<string, jsdoc.Tag>();
    function addTag(tag: jsdoc.Tag) {
      if (tag.tagName === 'implements') return;  // implements cannot be merged.
      const existing = tagsByName.get(tag.tagName);
      tagsByName.set(
          tag.tagName, existing ? jsdoc.merge([existing, tag]) : tag);
    }
    for (const extraTag of extraTags) addTag(extraTag);

    const isConstructor =
        fnDecls.find(d => d.kind === ts.SyntaxKind.Constructor) !== undefined;
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
      // TODO: there may be problems if an annotation doesn't apply to all
      // overloads; is it worth checking for this and erroring?
      for (const tag of tags) {
        if (tag.tagName === 'param' || tag.tagName === 'return') continue;
        addTag(tag);
      }

      const flags = ts.getCombinedModifierFlags(fnDecl);
      // Add @abstract on "abstract" declarations.
      if (flags & ts.ModifierFlags.Abstract) {
        addTag({tagName: 'abstract'});
      }
      // Add @protected/@private if present, but not to function declarations,
      // function expressions, nor arrow functions (who are not class members,
      // so visibility does not apply).
      if (fnDecls.every(
              d => !ts.isFunctionDeclaration(d) &&
                  !ts.isFunctionExpression(d) && !ts.isArrowFunction(d))) {
        if (flags & ts.ModifierFlags.Protected) {
          addTag({tagName: 'protected'});
        } else if (flags & ts.ModifierFlags.Private) {
          addTag({tagName: 'private'});
        } else if (!tagsByName.has('export') && !tagsByName.has('package')) {
          // TODO(b/202495167): remove the 'package' check above.
          addTag({tagName: 'public'});
        }
      }

      // Add any @template tags.
      // Multiple declarations with the same template variable names should
      // work: the declarations get turned into union types, and Closure
      // Compiler will need to find a union where all type arguments are
      // satisfied.
      if (fnDecl.typeParameters) {
        for (const tp of fnDecl.typeParameters) {
          typeParameterNames.add(getIdentifierText(tp.name));
        }
      }
      // Merge the parameters into a single list of merged names and list of
      // types
      const sig = typeChecker.getSignatureFromDeclaration(fnDecl);
      if (!sig || !sig.declaration) {
        throw new Error(`invalid signature ${fnDecl.name}`);
      }
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
          optional: paramNode.initializer !== undefined ||
              paramNode.questionToken !== undefined,
          parameterName: isThisParam ? undefined : name,
        };

        if (paramNode.dotDotDotToken === undefined) {
          // The simple case: a plain parameter type.
          newTag.type = this.typeToClosure(
              fnDecl, this.typeChecker.getTypeAtLocation(paramNode));
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
          hasThisParam ? sig.declaration.parameters.length - 1 :
                         sig.declaration.parameters.length);

      // Return type.
      if (!isConstructor) {
        const returnTag: jsdoc.Tag = {
          tagName: 'return',
        };
        const retType = typeChecker.getReturnTypeOfSignature(sig);
        // Generate a templated `@this` tag for TypeScript `foo(): this` return
        // type specification. Make sure not to do that if the function already
        // has used `@this` due to a this parameter. It's not clear how to
        // resolve the two conflicting this types best, the current solution
        // prefers the explicitly given `this` parameter.
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
      addTag({
        tagName: 'template',
        text: Array.from(typeParameterNames.values()).join(', ')
      });
    }

    const newDoc = Array.from(tagsByName.values());

    for (const extraTag of extraTags) {
      if (extraTag.tagName === 'implements') newDoc.push(extraTag);
    }

    if (thisTags.length > 0) {
      newDoc.push(jsdoc.merge(thisTags));
    }

    const minArgsCount = Math.min(...argCounts);
    const maxArgsCount = Math.max(...argCounts);

    // Merge the JSDoc tags for each overloaded parameter.
    // Ensure each parameter has a unique name; the merging process can
    // otherwise accidentally generate the same parameter name twice.
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
      if (!paramTag.restParam &&
          (paramTag.optional || foundOptional || i >= minArgsCount)) {
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
      parameterNames:
          newDoc.filter(t => t.tagName === 'param').map(t => t.parameterName!),
      thisReturnType,
    };
  }
}

/** Returns whether this declaration is in a `declare global {...} block */
function isGlobalAugmentation(decl: ts.Declaration) {
  let current: ts.Node|undefined = decl;
  while (current) {
    if (current.flags & ts.NodeFlags.GlobalAugmentation) return true;
    current = current.parent;
  }
  return false;
}
