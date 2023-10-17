/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ModulesManifest} from './modules_manifest';
import {createGoogCall, createGoogLoadedModulesRegistration, createNotEmittedStatementWithComments, createSingleQuoteStringLiteral, reportDiagnostic} from './transformer_util';

/**
 * Provides dependencies for and configures the goog namespace resolution
 * behavior.
 */
export interface GoogModuleProcessorHost {
  /**
   * Takes a context (ts.SourceFile.fileName of the current file) and the import
   * URL of an ES6 import and generates a googmodule module name for the
   * imported module.
   *
   * The import URL is guaranteed to point to another TypeScript file.
   * JavaScript imports are resolved using `jsPathToModuleName`.
   */
  pathToModuleName(context: string, importPath: string): string;
  /**
   * Takes the import URL of an ES6 import and returns the googmodule module
   * name for the imported module, iff the module is an original closure
   * JavaScript file.
   *
   * Warning: If this function is present, GoogModule won't produce diagnostics
   * for multiple provides.
   */
  jsPathToModuleName?(importPath: string): string|undefined;
  /**
   * Takes the import URL of an ES6 import and returns the property name that
   * should be stripped from the usage.
   *
   * Example:
   *
   *     // workspace/lib/bar.js
   *     goog.module('lib.Bar');
   *     exports = class Bar {};
   *     // workspace/main.ts
   *     import {Bar} from 'workspace/lib/bar';
   *     console.log(Bar);
   *
   * TypeScript transforms this into:
   *
   *     const bar_1 = require('workspace/lib/bar');
   *     console.log(bar_1.Bar);
   *
   * If jsPathToStripProperty() returns 'Bar', GoogModule transform this into:
   *
   *     const bar_1 = goog.require('lib.Bar');
   *     console.log(bar_1);
   */
  jsPathToStripProperty?(importPath: string): string|undefined;
  /**
   * If we do googmodule processing, we polyfill module.id, since that's
   * part of ES6 modules.  This function determines what the module.id will be
   * for each file.
   */
  fileNameToModuleId(fileName: string): string;

  /** Is the generated file meant for JSCompiler? */
  transformTypesToClosure?: boolean;

  options: ts.CompilerOptions;

  /**
   * What dynamic `import()` should be transformed to.
   * If 'closure', it's transformed to goog.requireDynamic().
   * If 'nodejs', it's the default behaviour, which is nodejs require.
   */
  transformDynamicImport: 'nodejs'|'closure';
}

/**
 * Resolves an import path to its goog namespace, if it points to an original
 * closure JavaScript file.
 *
 * Forwards to the same function on the host if present, otherwise relies on
 * marker symbols in Clutz .d.ts files.
 */
export function jsPathToNamespace(
    host: GoogModuleProcessorHost, context: ts.Node,
    diagnostics: ts.Diagnostic[], importPath: string,
    getModuleSymbol: () => ts.Symbol | undefined): string|undefined {
  const namespace = localJsPathToNamespace(host, importPath);
  if (namespace) return namespace;

  const moduleSymbol = getModuleSymbol();
  if (!moduleSymbol) return;
  return getGoogNamespaceFromClutzComments(
      context, diagnostics, importPath, moduleSymbol);
}

/**
 * Resolves an import path to its goog namespace, if it points to an original
 * closure JavaScript file, using only local information.
 *
 * Forwards to `jsPathToModuleName` on the host if present.
 */
export function localJsPathToNamespace(
    host: GoogModuleProcessorHost, importPath: string): string|undefined {
  if (importPath.match(/^goog:/)) {
    // This is a namespace import, of the form "goog:foo.bar".
    // Fix it to just "foo.bar".
    return importPath.substring('goog:'.length);
  }

  if (host.jsPathToModuleName) {
    return host.jsPathToModuleName(importPath);
  }

  return undefined;
}

/**
 * Resolves an import path and returns the property name that should be
 * stripped from usages.
 *
 * Forwards to the same function on the host if present, otherwise relies on
 * marker symbols in Clutz .d.ts files.
 */
export function jsPathToStripProperty(
    host: GoogModuleProcessorHost, importPath: string,
    getModuleSymbol: () => ts.Symbol | undefined): string|undefined {
  if (host.jsPathToStripProperty) {
    return host.jsPathToStripProperty(importPath);
  }

  const moduleSymbol = getModuleSymbol();
  if (!moduleSymbol) return;
  const stripDefaultNameSymbol =
      findLocalInDeclarations(moduleSymbol, '__clutz_strip_property');
  if (!stripDefaultNameSymbol) return;
  return literalTypeOfSymbol(stripDefaultNameSymbol) as string;
}

/**
 * Returns true if node is a property access of `child` on the identifier
 * `parent`.
 */
function isPropertyAccess(
    node: ts.Node, parent: string, child: string): boolean {
  if (!ts.isPropertyAccessExpression(node)) return false;
  return ts.isIdentifier(node.expression) &&
      node.expression.escapedText === parent && node.name.escapedText === child;
}

/** isUseStrict returns true if node is a "use strict"; statement. */
function isUseStrict(node: ts.Node): boolean {
  if (node.kind !== ts.SyntaxKind.ExpressionStatement) return false;
  const exprStmt = node as ts.ExpressionStatement;
  const expr = exprStmt.expression;
  if (expr.kind !== ts.SyntaxKind.StringLiteral) return false;
  const literal = expr as ts.StringLiteral;
  return literal.text === 'use strict';
}

/**
 * TypeScript inserts the following code to mark ES moduels in CommonJS:
 *   Object.defineProperty(exports, "__esModule", { value: true });
 * This matches that code snippet.
 */
function isEsModuleProperty(stmt: ts.ExpressionStatement): boolean {
  // We're matching the explicit source text generated by the TS compiler.
  // Object.defineProperty(exports, "__esModule", { value: true });
  const expr = stmt.expression;
  if (!ts.isCallExpression(expr)) return false;
  if (!isPropertyAccess(expr.expression, 'Object', 'defineProperty')) {
    return false;
  }
  if (expr.arguments.length !== 3) return false;
  const [exp, esM, val] = expr.arguments;
  if (!ts.isIdentifier(exp) || exp.escapedText !== 'exports') return false;
  if (!ts.isStringLiteral(esM) || esM.text !== '__esModule') return false;
  if (!ts.isObjectLiteralExpression(val) || val.properties.length !== 1) {
    return false;
  }
  const prop = val.properties[0];
  if (!ts.isPropertyAssignment(prop)) return false;
  const ident = prop.name;
  if (!ident || !ts.isIdentifier(ident) || ident.text !== 'value') return false;
  return prop.initializer.kind === ts.SyntaxKind.TrueKeyword;
}

/**
 * Return `true`, if the statement looks like a `void 0` export initializer
 * statement.
 *
 * TypeScript will assign `void 0` to **most** exported symbols at the
 * start of the output file for reasons having to do with CommonJS spec
 * compliance. (See https://github.com/microsoft/TypeScript/issues/38552)
 * TS uses chained assignment for this up to some arbitrary limit
 * (currently 50) so it doesn't have to have a separate statement for
 * every assignment.
 *
 * ```js
 * exports.p1 = exports.p2 = ... = exports.p50 = void 0;
 * exports.p51 = exports.p52 = ... = exports.pN = void 0;
 * ```
 * However, closure-compiler will complain about these statements for
 * several reasons.
 *
 * 1. These statements will come before any assignments directly to
 *    `exports` itself.
 * 2. Multiple assignments to `exports.p` are not allowed.
 * 3. Each assignment to `exports.p` must be a separate statement.
 *
 * We must drop these statements.
 *
 * Ideally we should make sure we don't drop any a statement that represents
 * client code that was actually trying to export a value of `void 0`.
 * Unfortunately, we've found that we cannot do that reliably without making
 * significant changes to the way we handle goog modules.
 *
 * TypeScript won't generate such initializing assignments for some
 * cases. These include the default export and symbols re-exported from
 * other modules, but the exact conditions for determining when an
 * initialization will appear and when it won't are undocumented.
 *
 * Also, we discovered that for at least the case of exports defined with
 * destructuring, TypeScript won't generate code that we can reliably
 * recognize here as being an export.
 *
 * ```
 * // original TS code
 * export const {X} = somethingWithAnXProperty;
 * ```
 *
 * ```
 * // Looks like this when we see it here.
 * exports.X = void 0; // init
 * // this `x` gets somehow turned into `exports.x` somewhere after our code
 * // runs. We suspect it's done with the substitution API, but aren't sure.
 * x = somethingWithAnXProperty.X;
 * ```
 *
 * For now we've decided that the chances of a human actually intentionally
 * exporting `void 0` is so low, that the danger of breaking that case is less
 * than the danger of us trying something complicated here and still failing
 * to catch an assignment we need to remove in some complex case we haven't
 * yet discovered.
 */
function checkExportsVoid0Assignment(expr: ts.Expression): boolean {
  // Verify this looks something like `exports.abc = exports.xyz = void 0;`.
  if (!ts.isBinaryExpression(expr)) return false;
  if (expr.operatorToken.kind !== ts.SyntaxKind.EqualsToken) return false;

  // Verify the left side of the expression is an access on `exports`.
  if (!ts.isPropertyAccessExpression(expr.left)) return false;
  if (!ts.isIdentifier(expr.left.expression)) return false;
  if (expr.left.expression.escapedText !== 'exports') return false;

  // If the right side is another `exports.abc = ...` check that to see if we
  // eventually hit a `void 0`.
  if (ts.isBinaryExpression(expr.right)) {
    return checkExportsVoid0Assignment(expr.right);
  }

  // Verify the right side is exactly "void 0";
  if (!ts.isVoidExpression(expr.right)) return false;
  if (!ts.isNumericLiteral(expr.right.expression)) return false;
  if (expr.right.expression.text !== '0') return false;
  return true;
}

/**
 * Returns the string argument if call is of the form
 *   require('foo')
 */
function extractRequire(call: ts.CallExpression): ts.StringLiteral|null {
  // Verify that the call is a call to require(...).
  if (call.expression.kind !== ts.SyntaxKind.Identifier) return null;
  const ident = call.expression as ts.Identifier;
  if (ident.escapedText !== 'require') return null;

  // Verify the call takes a single string argument and grab it.
  if (call.arguments.length !== 1) return null;
  const arg = call.arguments[0];
  if (arg.kind !== ts.SyntaxKind.StringLiteral) return null;
  return arg as ts.StringLiteral;
}

/**
 * extractModuleMarker extracts the value of a well known marker symbol from the
 * given module symbol. It returns undefined if the symbol wasn't found.
 */
export function extractModuleMarker(
    symbol: ts.Symbol,
    name: '__clutz_actual_namespace'|'__clutz_multiple_provides'|
    '__clutz_actual_path'|'__clutz_strip_property'|
    '__clutz2_actual_path'): string|boolean|undefined {
  const localSymbol = findLocalInDeclarations(symbol, name);
  if (!localSymbol) return undefined;
  return literalTypeOfSymbol(localSymbol);
}

/** Internal TypeScript APIs on ts.Declaration. */
declare interface InternalTsDeclaration {
  locals?: ts.SymbolTable;
}

/**
 * findLocalInDeclarations searches for a local name with the given name in all
 * declarations of the given symbol. Note that not all declarations are
 * containers that can have local symbols.
 */
function findLocalInDeclarations(symbol: ts.Symbol, name: string): ts.Symbol|
    undefined {
  if (!symbol.declarations) {
    return undefined;
  }

  for (const decl of symbol.declarations) {
    // This accesses a TypeScript internal API, "locals" of a container.
    // This allows declaring special symbols in e.g. d.ts modules as locals
    // that cannot be accessed from user code.
    const internalDecl = decl as InternalTsDeclaration;
    const locals = internalDecl.locals;
    if (!locals) continue;
    const sym = locals.get(ts.escapeLeadingUnderscores(name));
    if (sym) return sym;
  }
  return undefined;
}

/**
 * literalTypeOfSymbol returns the literal type of symbol if it is
 * declared in a variable declaration that has a literal type.
 */
function literalTypeOfSymbol(symbol: ts.Symbol): string|boolean|undefined {
  if (!symbol.declarations || symbol.declarations.length === 0) {
    return undefined;
  }
  const varDecl = symbol.declarations[0];
  if (!ts.isVariableDeclaration(varDecl)) return undefined;
  if (!varDecl.type || !ts.isLiteralTypeNode(varDecl.type)) return undefined;
  const literal = varDecl.type.literal;
  if (ts.isLiteralExpression(literal)) return literal.text;
  if (literal.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (literal.kind === ts.SyntaxKind.FalseKeyword) return false;
  return undefined;
}

/**
 * Returns the name of the goog.module, from which the given source file has
 * been generated.
 */
export function getOriginalGoogModuleFromComment(sf: ts.SourceFile): string|
    undefined {
  const leadingComments =
      sf.getFullText().substring(sf.getFullStart(), sf.getLeadingTriviaWidth());
  const match = /^\/\/ Original goog.module name: (.*)$/m.exec(leadingComments);
  if (match) {
    return match[1];
  }
  return undefined;
}

/**
 * For a given import URL, extracts or finds the namespace to pass to
 * `goog.require`:
 *
 * 1) source files can contain a comment, which contains the goog.module name.
 * 2) ambient modules can contain a special marker symbol
 *    (`__clutz_actual_namespace`) that overrides the namespace to import.
 *
 * This is used to mark imports of Closure JavaScript sources and map them back
 * to the correct goog.require namespace.
 *
 * If there's no special cased namespace, getGoogNamespaceFromClutzComments
 * returns null.
 *
 * This is independent of tsickle's regular pathToModuleId conversion logic and
 * happens before it.
 */
function getGoogNamespaceFromClutzComments(
    context: ts.Node, tsickleDiagnostics: ts.Diagnostic[], tsImport: string,
    moduleSymbol: ts.Symbol): string|undefined {
  if (moduleSymbol.valueDeclaration &&
      ts.isSourceFile(moduleSymbol.valueDeclaration)) {
    return getOriginalGoogModuleFromComment(moduleSymbol.valueDeclaration);
  }
  const actualNamespaceSymbol =
      findLocalInDeclarations(moduleSymbol, '__clutz_actual_namespace');
  if (!actualNamespaceSymbol) return;
  const hasMultipleProvides =
      findLocalInDeclarations(moduleSymbol, '__clutz_multiple_provides');
  if (hasMultipleProvides) {
    // Report an error...
    reportDiagnostic(
        tsickleDiagnostics, context,
        `referenced JavaScript module ${
            tsImport} provides multiple namespaces and cannot be imported by path.`);
    // ... but continue producing an emit that effectively references the first
    // provided symbol (to continue finding any additional errors).
  }
  const actualNamespace = literalTypeOfSymbol(actualNamespaceSymbol);
  if (actualNamespace === undefined || typeof actualNamespace !== 'string') {
    reportDiagnostic(
        tsickleDiagnostics, context,
        `referenced module's __clutz_actual_namespace not a variable with a string literal type`);
    return;
  }
  return actualNamespace;
}

/**
 * Converts a TS/ES module './import/path' into a goog.module compatible
 * namespace, handling regular imports and `goog:` namespace imports.
 */
function importPathToGoogNamespace(
    host: GoogModuleProcessorHost, context: ts.Node,
    diagnostics: ts.Diagnostic[], file: ts.SourceFile, tsImport: string,
    getModuleSymbol: () => ts.Symbol | undefined): string {
  const nsImport =
      jsPathToNamespace(host, context, diagnostics, tsImport, getModuleSymbol);
  if (nsImport != null) {
    return nsImport;
  }

  return host.pathToModuleName(file.fileName, tsImport);
}

/**
 * Replace "module.exports = ..." with just "exports = ...". Returns null if
 * `expr` is not an exports assignment.
 */
function rewriteModuleExportsAssignment(expr: ts.ExpressionStatement) {
  if (!ts.isBinaryExpression(expr.expression)) return null;
  if (expr.expression.operatorToken.kind !== ts.SyntaxKind.EqualsToken) {
    return null;
  }
  if (!isPropertyAccess(expr.expression.left, 'module', 'exports')) return null;
  return ts.setOriginalNode(
      ts.setTextRange(
          ts.factory.createExpressionStatement(ts.factory.createAssignment(
              ts.factory.createIdentifier('exports'), expr.expression.right)),
          expr),
      expr);
}

/**
 * Checks whether expr is of the form `exports.abc = identifier` and if so,
 * returns the string abc, otherwise returns null.
 */
function isExportsAssignment(expr: ts.Expression): string|null {
  // Verify this looks something like `exports.abc = ...`.
  if (!ts.isBinaryExpression(expr)) return null;
  if (expr.operatorToken.kind !== ts.SyntaxKind.EqualsToken) return null;

  // Verify the left side of the expression is an access on `exports`.
  if (!ts.isPropertyAccessExpression(expr.left)) return null;
  if (!ts.isIdentifier(expr.left.expression)) return null;
  if (expr.left.expression.escapedText !== 'exports') return null;

  // Check whether right side of assignment is an identifier.
  if (!ts.isIdentifier(expr.right)) return null;

  // Return the property name as string.
  return expr.left.name.escapedText.toString();
}

/**
 * Convert a series of comma-separated expressions
 *   x = foo, y(), z.bar();
 * with statements
 *   x = foo; y(); z.bar();
 * This is for handling in particular the case where
 *   exports.x = ..., exports.y = ...;
 * which Closure rejects.
 *
 * @return An array of statements if it converted, or null otherwise.
 */
function rewriteCommaExpressions(expr: ts.Expression): ts.Statement[]|null {
  // There are two representation for comma expressions:
  // 1) a tree of "binary expressions" whose contents are comma operators
  const isBinaryCommaExpression =
      (expr: ts.Expression): expr is ts.BinaryExpression =>
          ts.isBinaryExpression(expr) &&
      expr.operatorToken.kind === ts.SyntaxKind.CommaToken;
  // or,
  // 2) a "comma list" expression, where the subexpressions are in one array
  const isCommaList = (expr: ts.Expression): expr is ts.CommaListExpression =>
      expr.kind === ts.SyntaxKind.CommaListExpression;

  if (!isBinaryCommaExpression(expr) && !isCommaList(expr)) {
    return null;
  }

  // Recursively visit comma-separated subexpressions, and collect them all as
  // separate expression statements.
  return visit(expr);

  function visit(expr: ts.Expression): ts.Statement[] {
    if (isBinaryCommaExpression(expr)) {
      return visit(expr.left).concat(visit(expr.right));
    }
    if (isCommaList(expr)) {
      // TODO(blickly): Simplify using flatMap once node 11 available
      return ([] as ts.Statement[]).concat(...expr.elements.map(visit));
    }
    return [ts.setOriginalNode(
        ts.factory.createExpressionStatement(expr), expr)];
  }
}

/**
 * getAmbientModuleSymbol returns the module symbol for the module referenced
 * by the given URL. It special cases ambient module URLs that cannot be
 * resolved (e.g. because they exist on synthesized nodes) and looks those up
 * separately.
 */
export function getAmbientModuleSymbol(
    typeChecker: ts.TypeChecker, moduleUrl: ts.StringLiteral) {
  let moduleSymbol = typeChecker.getSymbolAtLocation(moduleUrl);
  if (!moduleSymbol) {
    // Angular compiler creates import statements that do not retain the
    // original AST (parse tree nodes). TypeChecker cannot resolve these
    // import statements, thus moduleSymbols ends up undefined.
    // The workaround is to resolve the module explicitly, using
    // an @internal API. TypeChecker has resolveExternalModuleName, but
    // that also relies on finding parse tree nodes.
    // Given that the feature that needs this (resolve Closure names) is
    // only relevant to ambient modules, we can fall back to the function
    // specific to ambient modules.
    const t = moduleUrl.text;
    moduleSymbol =
        // tslint:disable-next-line:no-any see above.
        (typeChecker as any).tryFindAmbientModuleWithoutAugmentations(t);
  }
  return moduleSymbol;
}

interface ExportedDeclaration {
  declarationSymbol: ts.Symbol&{
    valueDeclaration: ts.Declaration;
  };
  exportName: string;
}

/**
 * Gets exports of the given source file which refer to a declaration in this
 * same file. Does not include re-exports.
 */
function getExportedDeclarations(
    sourceFile: ts.SourceFile,
    typeChecker: ts.TypeChecker): ExportedDeclaration[] {
  const moduleSymbol = typeChecker.getSymbolAtLocation(sourceFile);
  if (!moduleSymbol) return [];

  const exportSymbols = typeChecker.getExportsOfModule(moduleSymbol);
  const result: ExportedDeclaration[] = [];
  for (const exportSymbol of exportSymbols) {
    const declarationSymbol = exportSymbol.flags & ts.SymbolFlags.Alias ?
        typeChecker.getAliasedSymbol(exportSymbol) :
        exportSymbol;
    const declarationFile = declarationSymbol.valueDeclaration?.getSourceFile();
    if (declarationFile?.fileName !== sourceFile.fileName) continue;
    result.push({
      declarationSymbol:
          declarationSymbol as ts.Symbol & {valueDeclaration: ts.Declaration},
      exportName: exportSymbol.name,
    });
  }
  return result;
}

/**
 * Returns true if class is decorated with experimental legacy decorators. The
 * class is extended with a __decorate call if either itself or one of the
 * constructor parameters have a decorator.
 */
function isClassDecorated(node: ts.ClassDeclaration): boolean {
  if (hasDecorator(node)) return true;
  const ctor = getFirstConstructorWithBody(node);
  if (!ctor) return false;
  return ctor.parameters.some(p => hasDecorator(p));
}

function getFirstConstructorWithBody(node: ts.ClassLikeDeclaration):
    ts.ConstructorDeclaration|undefined {
  return node.members.find(
      (member): member is ts.ConstructorDeclaration =>
          ts.isConstructorDeclaration(member) && !!member.body);
}

function hasDecorator(node: ts.HasDecorators): boolean {
  const decorators = ts.getDecorators(node);
  return !!decorators && decorators.length > 0;
}

/**
 * commonJsToGoogmoduleTransformer returns a transformer factory that converts
 * TypeScript's CommonJS module emit to Closure Compiler compatible goog.module
 * and goog.require statements.
 */
export function commonJsToGoogmoduleTransformer(
    host: GoogModuleProcessorHost, modulesManifest: ModulesManifest,
    typeChecker: ts.TypeChecker): (context: ts.TransformationContext) =>
    ts.Transformer<ts.SourceFile> {
  return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    // TS' CommonJS processing uses onSubstituteNode to, at the very end of
    // processing, substitute `modulename.someProperty` property accesses and
    // replace them with just `modulename` in two special cases. See below for
    // the cases & motivation.
    const previousOnSubstituteNode = context.onSubstituteNode;
    context.enableSubstitution(ts.SyntaxKind.PropertyAccessExpression);
    context.onSubstituteNode = (hint, node: ts.Node): ts.Node => {
      node = previousOnSubstituteNode(hint, node);
      // Check if this is a property.access.
      if (!ts.isPropertyAccessExpression(node)) return node;
      if (!ts.isIdentifier(node.expression)) return node;
      // Find the import declaration node.expression (the LHS) comes from.
      // This may be the original ImportDeclaration, if the identifier was
      // transformed from it.
      const orig = ts.getOriginalNode(node.expression);
      let importExportDecl: ts.ImportDeclaration|ts.ExportDeclaration;
      if (ts.isImportDeclaration(orig) || ts.isExportDeclaration(orig)) {
        importExportDecl = orig;
      } else {
        // Alternatively, we can try to find the declaration of the symbol. This
        // only works for user-written .default accesses, the generated ones do
        // not have a symbol associated as they are only produced in the
        // CommonJS transformation, after type checking.
        const sym = typeChecker.getSymbolAtLocation(node.expression);
        if (!sym) return node;
        const decls = sym.getDeclarations();
        if (!decls || !decls.length) return node;
        const decl = decls[0];
        if (decl.parent && decl.parent.parent &&
            ts.isImportDeclaration(decl.parent.parent)) {
          importExportDecl = decl.parent.parent;
        } else {
          return node;
        }
      }
      // export declaration with no URL.
      if (!importExportDecl.moduleSpecifier) return node;

      // If the import declaration's URL is a "goog:..." style namespace, then
      // all ".default" accesses on it should be replaced with the symbol
      // itself. This allows referring to the module-level export of a
      // "goog.module" or "goog.provide" as if it was an ES6 default export.
      const isDefaultAccess = node.name.text === 'default';
      const moduleSpecifier =
          importExportDecl.moduleSpecifier as ts.StringLiteral;
      if (isDefaultAccess && moduleSpecifier.text.startsWith('goog:')) {
        // Substitute "foo.default" with just "foo".
        return node.expression;
      }
      const stripPropertyName = jsPathToStripProperty(
          host, moduleSpecifier.text,
          () => getAmbientModuleSymbol(typeChecker, moduleSpecifier));
      if (!stripPropertyName) return node;
      // In this case, emit `modulename` instead of `modulename.property` if and
      // only if the accessed name matches the declared name.
      if (stripPropertyName === node.name.text) return node.expression;
      return node;
    };

    return (sf: ts.SourceFile): ts.SourceFile => {
      // In TS2.9, transformers can receive Bundle objects, which this code
      // cannot handle (given that a bundle by definition cannot be a
      // goog.module()). The cast through any is necessary to remain compatible
      // with earlier TS versions.
      // tslint:disable-next-line:no-any
      if ((sf as any)['kind'] !== ts.SyntaxKind.SourceFile) return sf;

      const exportedDeclarations = getExportedDeclarations(sf, typeChecker);

      let moduleVarCounter = 1;
      /**
       * Creates a new unique variable name for holding an imported module. This
       * is used to split places where TS wants to codegen code like:
       *   someExpression(require(...));
       * which we then rewrite into
       *   var x = require(...); someExpression(x);
       */
      function nextModuleVar() {
        return `tsickle_module_${moduleVarCounter++}_`;
      }

      /**
       * Maps goog.require namespaces to the variable name they are assigned
       * into. E.g.: var $varName = goog.require('$namespace'));
       */
      const namespaceToModuleVarName = new Map<string, ts.Identifier>();

      /**
       * maybeCreateGoogRequire returns a `goog.require()` call for the given
       * CommonJS `require` call. Returns null if `call` is not a CommonJS
       * require.
       *
       * @param newIdent The identifier to assign the result of the goog.require
       *     to, or undefined if no assignment is needed.
       */
      function maybeCreateGoogRequire(
          original: ts.Statement, call: ts.CallExpression,
          newIdent: ts.Identifier|undefined): ts.Statement|null {
        const importedUrl = extractRequire(call);
        if (!importedUrl) return null;
        // if importPathToGoogNamespace reports an error, it has already been
        // reported when originally transforming the file to JS (e.g. to produce
        // the goog.requireType call). Side-effect imports generate no
        // requireType, but given they do not import a symbol, there is also no
        // ambiguity what symbol to import, so not reporting an error for
        // side-effect imports is working as intended.
        const ignoredDiagnostics: ts.Diagnostic[] = [];
        const imp = importPathToGoogNamespace(
            host, importedUrl, ignoredDiagnostics, sf, importedUrl.text,
            () => getAmbientModuleSymbol(typeChecker, importedUrl));
        modulesManifest.addReferencedModule(sf.fileName, imp);
        const existingImport: ts.Identifier|undefined =
            namespaceToModuleVarName.get(imp);
        let initializer: ts.Expression;
        if (!existingImport) {
          if (newIdent) namespaceToModuleVarName.set(imp, newIdent);
          initializer =
              createGoogCall('require', createSingleQuoteStringLiteral(imp));
        } else {
          initializer = existingImport;
        }

        // In JS modules it's recommended that users get a handle on the
        // goog namespace via:
        //
        //    import * as goog from 'google3/javascript/closure/goog.js';
        //
        // In a goog.module we just want to access the global `goog` value,
        // so we skip emitting that import as a goog.require.
        // We check the goog module name so that we also catch relative imports.
        if (newIdent && newIdent.escapedText === 'goog' &&
            imp === 'google3.javascript.closure.goog') {
          return createNotEmittedStatementWithComments(sf, original);
        }

        const useConst = host.options.target !== ts.ScriptTarget.ES5;


        if (newIdent) {
          // Create a statement like one of:
          //   var foo = goog.require('bar');
          //   var foo = existingImport;
          const varDecl = ts.factory.createVariableDeclaration(
              newIdent, /* exclamationToken */ undefined, /* type */ undefined,
              initializer);
          const newStmt = ts.factory.createVariableStatement(
              /* modifiers */ undefined,
              ts.factory.createVariableDeclarationList(
                  [varDecl],
                  // Use 'const' in ES6 mode so Closure properly forwards type
                  // aliases.
                  useConst ? ts.NodeFlags.Const : undefined));
          return ts.setOriginalNode(
              ts.setTextRange(newStmt, original), original);
        } else if (!newIdent && !existingImport) {
          // Create a statement like:
          //   goog.require('bar');
          const newStmt = ts.factory.createExpressionStatement(initializer);
          return ts.setOriginalNode(
              ts.setTextRange(newStmt, original), original);
        }
        return createNotEmittedStatementWithComments(sf, original);
      }

      /**
       * Rewrite goog.declareModuleId to something that works in a goog.module.
       *
       * goog.declareModuleId exposes a JS module as a goog.module. After we
       * convert the JS module to a goog.module, what we really want is to
       * expose the current goog.module at two different module ids. This isn't
       * possible with the public APIs, but we can make it work at runtime
       * by writing a record to goog.loadedModules_.
       *
       * This only works at runtime, and would fail if compiled by closure
       * compiler, but that's ok because we only transpile JS in development
       * mode.
       */
      function maybeRewriteDeclareModuleId(
          original: ts.Statement, call: ts.CallExpression): ts.Statement|null {
        // Verify that the call is a call to goog.declareModuleId(...).
        if (!ts.isPropertyAccessExpression(call.expression)) {
          return null;
        }
        const propAccess = call.expression;
        if (propAccess.name.escapedText !== 'declareModuleId') {
          return null;
        }
        if (!ts.isIdentifier(propAccess.expression) ||
            propAccess.expression.escapedText !== 'goog') {
          return null;
        }

        // Verify the call takes a single string argument and grab it.
        if (call.arguments.length !== 1) {
          return null;
        }
        const arg = call.arguments[0];
        if (!ts.isStringLiteral(arg)) {
          return null;
        }
        const newStmt = createGoogLoadedModulesRegistration(
            arg.text, ts.factory.createIdentifier('exports'));
        return ts.setOriginalNode(ts.setTextRange(newStmt, original), original);
      }

      interface ExportsAssignment extends ts.ExpressionStatement {
        expression: ts.BinaryExpression&{
          left: ts.PropertyAccessExpression;
          right: ts.Identifier;
        };
      }

      interface RewrittenExportsAssignment {
        statement: ts.Statement;
        exports: ExportsAssignment[];
      }

      /**
       * Rewrite legacy decorators output to be a valid Closure JS.
       *
       * If the statement looks like `let X = exports.Y = Z;` (causing
       * JSC_EXPORT_NOT_A_STATEMENT error), transform it into separate
       * statements `let X = Z;` and `exports.Y = X;`.
       */
      function maybeRewriteDecoratedClassChainInitializer(
          stmt: ts.VariableStatement,
          decl: ts.VariableDeclaration): RewrittenExportsAssignment|null {
        const originalNode = ts.getOriginalNode(stmt);
        if (!originalNode || !ts.isClassDeclaration(originalNode) ||
            !isClassDecorated(originalNode)) {
          return null;
        }

        if (!ts.isIdentifier(decl.name) || !decl.initializer ||
            !ts.isBinaryExpression(decl.initializer) ||
            decl.initializer.operatorToken.kind !== ts.SyntaxKind.EqualsToken ||
            !ts.isPropertyAccessExpression(decl.initializer.left) ||
            !ts.isIdentifier(decl.initializer.left.expression) ||
            decl.initializer.left.expression.text !== 'exports') {
          return null;
        }

        const updatedDecl = ts.factory.updateVariableDeclaration(
            decl, decl.name, decl.exclamationToken, decl.type,
            decl.initializer.right);
        const newStmt = ts.factory.updateVariableStatement(
            stmt, stmt.modifiers,
            ts.factory.updateVariableDeclarationList(
                stmt.declarationList, [updatedDecl]));
        return {
          statement: newStmt,
          exports: [
            ts.factory.createExpressionStatement(ts.factory.createAssignment(
                decl.initializer.left, decl.name)) as ExportsAssignment,
          ],
        };
      }

      /**
       * Returns if this is an export assigmment (`exports.X = X;`) where `X`
       * is a class with decorators.
       */
      function isExportsAssignmentForDecoratedClass(
          stmt: ts.ExpressionStatement): stmt is ExportsAssignment {
        if (!ts.isBinaryExpression(stmt.expression) ||
            stmt.expression.operatorToken.kind !== ts.SyntaxKind.EqualsToken ||
            !ts.isPropertyAccessExpression(stmt.expression.left) ||
            !ts.isIdentifier(stmt.expression.left.expression) ||
            stmt.expression.left.expression.escapedText !== 'exports' ||
            !ts.isIdentifier(stmt.expression.right)) {
          return false;
        }

        // Variable statements in the form of `export const Y = X;` don't count.
        if (ts.isVariableStatement(ts.getOriginalNode(stmt))) return false;

        const nameSymbol =
            typeChecker.getSymbolAtLocation(stmt.expression.right);
        if (!nameSymbol || !nameSymbol.valueDeclaration) return false;

        return ts.isClassDeclaration(nameSymbol.valueDeclaration) &&
            isClassDecorated(nameSymbol.valueDeclaration);
      }

      /**
       * Rewrite legacy decorators output to be a valid Closure JS.
       *
       * TypeScript later substitutes `X = __decorate(X, ...)` with `X =
       * exports.X = ...` which makes it invalid for Closure JS.
       *
       * This disables the substitution for __decorate calls. Exports
       * assignments are instead delayed until the end of the source file. See
       * `delayedDecoratedClassExports`.
       */
      function maybeRewriteDecoratedClassDecorateCall(
          stmt: ts.ExpressionStatement): ts.ExpressionStatement|null {
        if (!ts.isBinaryExpression(stmt.expression) ||
            stmt.expression.operatorToken.kind !== ts.SyntaxKind.EqualsToken ||
            !ts.isIdentifier(stmt.expression.left)) {
          return null;
        }

        const originalNode = ts.getOriginalNode(stmt);
        if (!ts.isClassDeclaration(originalNode) ||
            !isClassDecorated(originalNode)) {
          return null;
        }

        // Stop TypeScript from adding inline exports assignments in
        // onSubstituteNode callback.
        ts.setEmitFlags(stmt.expression, ts.EmitFlags.NoSubstitution);

        return stmt;
      }

      /**
       * Starting with version 5.1, TypeScript emits exports assignment in
       * CommonJS inside the iife argument of namespaces and enums:
       *
       *     var Foo;
       *     (function (Foo) {
       *     })(Foo || (exports.Foo = exports.Bar = Foo = {}));
       *
       * This function expects to be called with the second statement (the call
       * expression). It returns exports assignments as separate statements.
       *
       * Note: At the time the transformer runs the exports assignments aren't
       * in the AST. They are added in the onSubstituteNode callback. See:
       * https://github.com/microsoft/TypeScript/blob/d8585688dd1bc8d82b7b5daab9af83ae1e3de197/src/compiler/transformers/module/module.ts#L2341-L2367
       */
      function maybeRewriteExportsAssignmentInIifeArguments(
          stmt: ts.ExpressionStatement): RewrittenExportsAssignment|null {
        if (!ts.isCallExpression(stmt.expression)) return null;

        // Checks call: `(function (...) { ... })(single_argument)`
        const call = stmt.expression;
        if (!ts.isParenthesizedExpression(call.expression) ||
            !ts.isFunctionExpression(call.expression.expression) ||
            call.arguments.length !== 1) {
          return null;
        }

        // Checks argument: `identifier || (identifier = {})`
        const arg = call.arguments[0];
        if (!ts.isBinaryExpression(arg) || !ts.isIdentifier(arg.left) ||
            arg.operatorToken.kind !== ts.SyntaxKind.BarBarToken ||
            !ts.isParenthesizedExpression(arg.right) ||
            !ts.isBinaryExpression(arg.right.expression) ||
            arg.right.expression.operatorToken.kind !==
                ts.SyntaxKind.EqualsToken ||
            !ts.isIdentifier(arg.right.expression.left) ||
            !ts.isObjectLiteralExpression(arg.right.expression.right)) {
          return null;
        }

        const name = arg.right.expression.left;
        const nameSymbol = typeChecker.getSymbolAtLocation(name);
        const matchingExports = exportedDeclarations.filter(
            decl => decl.declarationSymbol === nameSymbol);

        // Only needs modification if it's exported. Note that it may be
        // exported multiple times under different names, e.g.:
        //     export enum Foo {}
        //     export {Foo as Bar};
        if (matchingExports.length === 0) return null;

        // Stop TypeScript from adding inline exports assignments in
        // onSubstituteNode callback.
        ts.setEmitFlags(arg.right.expression, ts.EmitFlags.NoSubstitution);

        // Namespaces can merge with classes and functions. TypeScript emits
        // separate exports assignments for those. Don't emit extra ones here.
        const notAlreadyExported = matchingExports.filter(
            decl => !ts.isClassDeclaration(
                        decl.declarationSymbol.valueDeclaration) &&
                !ts.isFunctionDeclaration(
                    decl.declarationSymbol.valueDeclaration));

        const exportNames = notAlreadyExported.map(decl => decl.exportName);
        return {
          statement: stmt,
          exports: exportNames.map(
              exportName =>
                  ts.factory.createExpressionStatement(
                      ts.factory.createAssignment(
                          ts.factory.createPropertyAccessExpression(
                              ts.factory.createIdentifier('exports'),
                              ts.factory.createIdentifier(exportName)),
                          name)) as ExportsAssignment),
        };
      }

      /**
       * Rewrites code generated by `export * as ns from 'ns'` to something
       * like:
       *
       * ```
       * const tsickle_module_n_ = goog.require('ns');
       * exports.ns = tsickle_module_n_;
       * ```
       *
       * Separating the `goog.require` and `exports.ns` assignment is required
       * by Closure to correctly infer the type of the exported namespace.
       */
      function maybeRewriteExportStarAsNs(stmt: ts.Statement): ts.Statement[]|
          null {
        // Ensure this looks something like `exports.ns = require('ns);`.
        if (!ts.isExpressionStatement(stmt)) return null;
        if (!ts.isBinaryExpression(stmt.expression)) return null;
        if (stmt.expression.operatorToken.kind !== ts.SyntaxKind.EqualsToken) {
          return null;
        }

        // Ensure the left side of the expression is an access on `exports`.
        if (!ts.isPropertyAccessExpression(stmt.expression.left)) return null;
        if (!ts.isIdentifier(stmt.expression.left.expression)) return null;
        if (stmt.expression.left.expression.escapedText !== 'exports') {
          return null;
        }

        // Grab the call to `require`, and exit early if not calling `require`.
        if (!ts.isCallExpression(stmt.expression.right)) return null;
        const ident = ts.factory.createIdentifier(nextModuleVar());
        const require =
            maybeCreateGoogRequire(stmt, stmt.expression.right, ident);
        if (!require) return null;

        const exportedName = stmt.expression.left.name;
        const exportStmt = ts.setOriginalNode(
            ts.setTextRange(
                ts.factory.createExpressionStatement(
                    ts.factory.createAssignment(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier('exports'),
                            exportedName),
                        ident)),
                stmt),
            stmt);
        ts.addSyntheticLeadingComment(
            exportStmt, ts.SyntaxKind.MultiLineCommentTrivia, '* @const ',
            /* trailing newline */ true);

        return [require, exportStmt];
      }

      /**
       * When re-exporting an export from another module TypeScript will wrap it
       * with an `Object.defineProperty` and getter function to emulate a live
       * binding, per the ESM spec. goog.module doesn't allow for mutable
       * exports and Closure Compiler doesn't allow `Object.defineProperty` to
       * be used with `exports`, so we rewrite the live binding to look like a
       * plain `exports` assignment. For example, this statement:
       *
       * ```
       * Object.defineProperty(exports, "a", {
       *   enumerable: true, get: function () { return a_1.a; }
       * });
       * ```
       *
       * will be transformed into:
       *
       * ```
       * exports.a = a_1.a;
       * ```
       */
      function rewriteObjectDefinePropertyOnExports(
          stmt: ts.ExpressionStatement): ts.Statement|null {
        // Verify this node is a function call.
        if (!ts.isCallExpression(stmt.expression)) return null;

        // Verify the node being called looks like `a.b`.
        const callExpr = stmt.expression;
        if (!ts.isPropertyAccessExpression(callExpr.expression)) return null;

        // Verify that the `a.b`-ish thing is actully `Object.defineProperty`.
        const propAccess = callExpr.expression;
        if (!ts.isIdentifier(propAccess.expression)) return null;
        if (propAccess.expression.text !== 'Object') return null;
        if (propAccess.name.text !== 'defineProperty') return null;

        // Grab each argument to `Object.defineProperty`, and verify that there
        // are exactly three arguments. The first argument should be the global
        // `exports` object, the second is the exported name as a string
        // literal, and the third is a configuration object.
        if (callExpr.arguments.length !== 3) return null;
        const [objDefArg1, objDefArg2, objDefArg3] = callExpr.arguments;
        if (!ts.isIdentifier(objDefArg1)) return null;
        if (objDefArg1.text !== 'exports') return null;
        if (!ts.isStringLiteral(objDefArg2)) return null;
        if (!ts.isObjectLiteralExpression(objDefArg3)) return null;

        // Returns a "finder" function to location an object property.
        function findPropNamed(name: string) {
          return (p: ts.ObjectLiteralElementLike) => {
            return ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) &&
                p.name.text === name;
          };
        }

        // Verify that the export is marked as enumerable. If it isn't then this
        // was not generated by TypeScript.
        const enumerableConfig =
            objDefArg3.properties.find(findPropNamed('enumerable'));
        if (!enumerableConfig) return null;
        if (!ts.isPropertyAssignment(enumerableConfig)) return null;
        if (enumerableConfig.initializer.kind !== ts.SyntaxKind.TrueKeyword) {
          return null;
        }

        // Verify that the export has a getter function.
        const getConfig = objDefArg3.properties.find(findPropNamed('get'));
        if (!getConfig) return null;
        if (!ts.isPropertyAssignment(getConfig)) return null;
        if (!ts.isFunctionExpression(getConfig.initializer)) return null;

        // Verify that the getter function has exactly one statement that is a
        // return statement. The node being returned is the real exported value.
        const getterFunc = getConfig.initializer;
        if (getterFunc.body.statements.length !== 1) return null;
        const getterReturn = getterFunc.body.statements[0];
        if (!ts.isReturnStatement(getterReturn)) return null;
        const realExportValue = getterReturn.expression;
        if (!realExportValue) return null;

        // Create a new export statement using the exported name found as the
        // second argument to `Object.defineProperty` with the value of the
        // node returned by the getter function.
        const exportStmt = ts.setOriginalNode(
            ts.setTextRange(
                ts.factory.createExpressionStatement(
                    ts.factory.createAssignment(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier('exports'),
                            objDefArg2.text),
                        realExportValue)),
                stmt),
            stmt);

        return exportStmt;
      }

      const exportsSeen = new Set<string>();
      const seenNamespaceOrEnumExports = new Set<string>();

      /**
       * Map of export names to their exports assignment node.
       *
       * Used to delay exports assignments for decorated classes. They may be
       * re-assigned later with __decorate calls. Exports assignments have to be
       * emitted after that.
       *
       * We can't wait for __decorate calls, though, because they're not present
       * for Angular builds. The Angular compiler has a different decorator
       * emit.
       *
       * Solution: Emit them at the end of the source file.
       */
      const delayedDecoratedClassExports =
          new Map<string, ts.ExpressionStatement>();

      /**
       * visitTopLevelStatement implements the main CommonJS to goog.module
       * conversion. It visits a SourceFile level statement and adds a
       * (possibly) transformed representation of it into stmts. It adds at
       * least one node per statement to stmts.
       *
       * visitTopLevelStatement:
       * - converts require() calls to goog.require() calls, with or w/o var
       * assignment
       * - removes "use strict"; and "Object.defineProperty(__esModule)"
       * statements
       * - converts module.exports assignments to just exports assignments
       * - splits __exportStar() calls into require and export (this needs two
       * statements)
       * - makes sure to only import each namespace exactly once, and use
       * variables later on
       */
      function visitTopLevelStatement(
          stmts: ts.Statement[], sf: ts.SourceFile, node: ts.Statement): void {
        // Handle each particular case by adding node to stmts, then
        // return. For unhandled cases, break to jump to the default handling
        // below.

        switch (node.kind) {
          case ts.SyntaxKind.ExpressionStatement: {
            const exprStmt = node as ts.ExpressionStatement;
            // Check for "use strict" and certain Object.defineProperty and skip
            // it if necessary.
            if (isUseStrict(exprStmt) || isEsModuleProperty(exprStmt)) {
              stmts.push(createNotEmittedStatementWithComments(sf, exprStmt));
              return;
            }

            // If we have not already seen the defaulted export assignment
            // initializing all exports to `void 0`, skip the statement and mark
            // that we have have now seen it.
            if (checkExportsVoid0Assignment(exprStmt.expression)) {
              stmts.push(createNotEmittedStatementWithComments(sf, exprStmt));
              return;
            }

            // Check for:
            //   module.exports = ...;
            const modExports = rewriteModuleExportsAssignment(exprStmt);
            if (modExports) {
              stmts.push(modExports);
              return;
            }
            // Check for use of the comma operator.
            // This occurs in code like
            //   exports.a = ..., exports.b = ...;
            // which we want to change into multiple statements.
            const commaExpanded = rewriteCommaExpressions(exprStmt.expression);
            if (commaExpanded) {
              stmts.push(...commaExpanded);
              return;
            }
            // Check for:
            //   exports.ns = require('...');
            // which is generated by the `export * as ns from` syntax.
            const exportStarAsNs = maybeRewriteExportStarAsNs(exprStmt);
            if (exportStarAsNs) {
              stmts.push(...exportStarAsNs);
              return;
            }

            // Checks for:
            //   Object.defineProperty(exports, 'a', {
            //     enumerable: true, get: { return ...; }
            //   })
            // which is a live binding generated when re-exporting from another
            // module.
            const exportFromObjDefProp =
                rewriteObjectDefinePropertyOnExports(exprStmt);
            if (exportFromObjDefProp) {
              stmts.push(exportFromObjDefProp);
              return;
            }

            // Avoid EXPORT_REPEATED_ERROR from JSCompiler. Occurs for:
            //     class Foo {}
            //     namespace Foo { ... }
            //     export {Foo};
            // TypeScript emits 2 separate exports assignments. One after the
            // class and one after the namespace.
            // TODO(b/277272562): TypeScript 5.1 changes how exports assignments
            // are emitted, making this no longer an issue. On the other hand
            // this is unsafe. We really need to keep the _last_ (not the first)
            // export assignment in the general case. Remove this check after
            // the 5.1 upgrade.
            const exportName = isExportsAssignment(exprStmt.expression);
            if (exportName) {
              if (exportsSeen.has(exportName)) {
                stmts.push(createNotEmittedStatementWithComments(sf, exprStmt));
                return;
              }
              exportsSeen.add(exportName);
            }

            // TODO(b/277272562): This code works in 5.1. But breaks in 5.0,
            // which emits separate exports assignments for namespaces and enums
            // and this code would emit duplicate exports assignments. Run this
            // unconditionally after 5.1 has been released.
            if ((ts.versionMajorMinor as string) !== '5.0') {
              // Check for inline exports assignments as they are emitted for
              // exported namespaces and enums, e.g.:
              //   (function (Foo) {
              //   })(Foo || (exports.Foo = exports.Bar = Foo = {}));
              // and moves the exports assignments to a separate statement.
              const exportInIifeArguments =
                  maybeRewriteExportsAssignmentInIifeArguments(exprStmt);
              if (exportInIifeArguments) {
                stmts.push(exportInIifeArguments.statement);
                for (const newExport of exportInIifeArguments.exports) {
                  const exportName = newExport.expression.left.name.text;
                  // Namespaces produce multiple exports assignments when
                  // they're re-opened in the same file. Only emit the first one
                  // here. This is fine because the namespace object itself
                  // cannot be re-assigned later.
                  if (!seenNamespaceOrEnumExports.has(exportName)) {
                    stmts.push(newExport);
                    seenNamespaceOrEnumExports.add(exportName);
                  }
                }
                return;
              }
            }

            // Delay `exports.X = X` assignments for decorated classes.
            if (isExportsAssignmentForDecoratedClass(exprStmt)) {
              delayedDecoratedClassExports.set(
                  exprStmt.expression.left.name.text, exprStmt);
              return;
            }

            // Don't add duplicate exports assignments on __decorate calls.
            const newStmt = maybeRewriteDecoratedClassDecorateCall(exprStmt);
            if (newStmt) {
              stmts.push(newStmt);
              return;
            }

            // The rest of this block handles only some function call forms:
            //   goog.declareModuleId(...);
            //   require('foo');
            //   __exportStar(require('foo'), ...);
            const expr = exprStmt.expression;
            if (!ts.isCallExpression(expr)) break;
            let callExpr = expr;

            // Check for declareModuleId.
            const declaredModuleId =
                maybeRewriteDeclareModuleId(exprStmt, callExpr);
            if (declaredModuleId) {
              stmts.push(declaredModuleId);
              return;
            }

            // Check for __exportStar, the commonjs version of 'export *'.
            // export * creates either a pure top-level '__export(require(...))'
            // or the imported version, 'tslib.__exportStar(require(...))'. The
            // imported version is only substituted later on though, so appears
            // as a plain "__exportStar" on the top level here.
            const isExportStar = ts.isIdentifier(expr.expression) &&
                (expr.expression.text === '__exportStar' ||
                 expr.expression.text === '__export');
            let newIdent: ts.Identifier|undefined;
            if (isExportStar) {
              // Extract the goog.require() from the call. (It will be verified
              // as a goog.require() below.)
              callExpr = expr.arguments[0] as ts.CallExpression;
              newIdent = ts.factory.createIdentifier(nextModuleVar());
            }

            // Check whether the call is actually a require() and translate
            // as appropriate.
            const require =
                maybeCreateGoogRequire(exprStmt, callExpr, newIdent);
            if (!require) break;
            stmts.push(require);

            // If this was an export star, split it up into the import (created
            // by the maybe call above), and the export operation. This avoids a
            // Closure complaint about non-top-level requires.
            if (isExportStar) {
              const args: ts.Expression[] = [newIdent!];
              if (expr.arguments.length > 1) args.push(expr.arguments[1]);
              stmts.push(ts.factory.createExpressionStatement(
                  ts.factory.createCallExpression(
                      expr.expression, undefined, args)));
            }
            return;
          }
          case ts.SyntaxKind.VariableStatement: {
            const varStmt = node as ts.VariableStatement;
            // Verify it's a single decl (and not "var x = ..., y = ...;").
            if (varStmt.declarationList.declarations.length !== 1) break;
            const decl = varStmt.declarationList.declarations[0];

            // Grab the variable name (avoiding things like destructuring
            // binds).
            if (decl.name.kind !== ts.SyntaxKind.Identifier) break;

            // It's possibly of the form "var x = require(...);".
            if (decl.initializer && ts.isCallExpression(decl.initializer)) {
              const require =
                  maybeCreateGoogRequire(varStmt, decl.initializer, decl.name);
              if (require) {
                stmts.push(require);
                return;
              }
            }

            // Check if it's a statement like `let X = exports.X = class X`
            // where `X` has decorators.
            const declWithChainInitializer =
                maybeRewriteDecoratedClassChainInitializer(varStmt, decl);
            if (declWithChainInitializer) {
              stmts.push(declWithChainInitializer.statement);
              for (const newExport of declWithChainInitializer.exports) {
                delayedDecoratedClassExports.set(
                    newExport.expression.left.name.text, newExport);
              }
              return;
            }

            break;
          }
          default:
            break;
        }
        stmts.push(node);
      }

      const moduleName = host.pathToModuleName('', sf.fileName);
      // Register the namespace this file provides.
      modulesManifest.addModule(sf.fileName, moduleName);

      /**
       * Transforms:
       * Promise.resolve().then(() => require(stringLiteral));
       * into
       * goog.requireDynamic(moduleName);
       *
       * Note: Depends on TypeScript's CommonJS transform. With module=commonjs
       * and esModuleInterop=false, TypeScript converts import(stringLiteral) to
       * Promise.resolve().then(() => require(stringLiteral));
       * or
       * Promise.resolve().then(function() { return require(stringLiteral); });
       * Import assertions are not a concern, module=commonjs doesn't support
       * them.
       */
      function rewriteDynamicRequire(node: ts.Node): ts.Node|null {
        // Look for  `???( ??? )`
        if (!ts.isCallExpression(node) || node.arguments.length !== 1) {
          return null;
        }

        let importedUrl: ts.StringLiteral|null = null;

        // Look for `???(() => require(???))`
        if (ts.isArrowFunction(node.arguments[0]) &&
            ts.isCallExpression(node.arguments[0].body)) {
          importedUrl = extractRequire(node.arguments[0].body);
        }

        // Look for `???(function(){ return require(???); })`
        if (ts.isFunctionExpression(node.arguments[0]) &&
            ts.isBlock(node.arguments[0].body) &&
            node.arguments[0].body.statements.length === 1 &&
            ts.isReturnStatement(node.arguments[0].body.statements[0]) &&
            node.arguments[0].body.statements[0].expression != null &&
            ts.isCallExpression(
                node.arguments[0].body.statements[0].expression)) {
          importedUrl =
              extractRequire(node.arguments[0].body.statements[0].expression);
        }

        if (!importedUrl) {
          return null;
        }

        const callee = node.expression;
        if (!ts.isPropertyAccessExpression(callee) ||
            callee.name.escapedText !== 'then' ||
            !ts.isCallExpression(callee.expression)) {
          return null;
        }
        const resolveCall = callee.expression;
        if (resolveCall.arguments.length !== 0 ||
            !ts.isPropertyAccessExpression(resolveCall.expression) ||
            !ts.isIdentifier(resolveCall.expression.expression) ||
            resolveCall.expression.expression.escapedText !== 'Promise' ||
            !ts.isIdentifier(resolveCall.expression.name) ||
            resolveCall.expression.name.escapedText !== 'resolve') {
          return null;
        }
        const ignoredDiagnostics: ts.Diagnostic[] = [];
        const imp = importPathToGoogNamespace(
            host, importedUrl, ignoredDiagnostics, sf, importedUrl.text,
            () => getAmbientModuleSymbol(typeChecker, importedUrl!));
        modulesManifest.addReferencedModule(sf.fileName, imp);

        return createGoogCall(
            'requireDynamic', createSingleQuoteStringLiteral(imp));
      }

      const visitForDynamicImport: ts.Visitor = (node) => {
        const replacementNode = rewriteDynamicRequire(node);
        if (replacementNode) {
          return replacementNode;
        }
        return ts.visitEachChild(node, visitForDynamicImport, context);
      };

      if (host.transformDynamicImport === 'closure') {
        // TODO: go/ts50upgrade - Remove after upgrade.
        // tslint:disable-next-line:no-unnecessary-type-assertion
        sf = ts.visitNode(sf, visitForDynamicImport, ts.isSourceFile)!;
      }

      // Convert each top level statement to goog.module.
      const stmts: ts.Statement[] = [];
      for (const stmt of sf.statements) {
        visitTopLevelStatement(stmts, sf, stmt);
      }

      // Emit exports assignments for decorated classes at the end, after all
      // potential re-assignments.
      stmts.push(...delayedDecoratedClassExports.values());

      // Additional statements that will be prepended (goog.module call etc).
      const headerStmts: ts.Statement[] = [];

      // Emit: goog.module('moduleName');
      const googModule = ts.factory.createExpressionStatement(
          createGoogCall('module', createSingleQuoteStringLiteral(moduleName)));
      headerStmts.push(googModule);

      maybeAddModuleId(host, typeChecker, sf, headerStmts);

      // Add `goog.require('tslib');` it hasn't already been required.
      // Rationale: TS gets compiled to Development mode
      // (ES5) and Closure mode (~ES6) sources. Tooling generates module
      // manifests from the Closure version. These manifests are used both with
      // the Closure version and the Development mode version. 'tslib' is
      // sometimes required by the development version but not the Closure
      // version. Inserting the import below unconditionally makes sure that the
      // module manifests are identical between Closure and Development mode,
      // avoiding breakages caused by missing module dependencies.

      // Get a copy of the already resolved module names before calling
      // resolveModuleName on 'tslib'. Otherwise, resolveModuleName will
      // add 'tslib' to namespaceToModuleVarName and prevent checking whether
      // 'tslib' has already been required.
      const resolvedModuleNames = [...namespaceToModuleVarName.keys()];

      const tslibModuleName = host.pathToModuleName(sf.fileName, 'tslib');

      // Only add the extra require if it hasn't already been required
      if (resolvedModuleNames.indexOf(tslibModuleName) === -1) {
        const tslibImport = ts.factory.createExpressionStatement(createGoogCall(
            'require', createSingleQuoteStringLiteral(tslibModuleName)));

        // Place the goog.require('tslib') statement right after the
        // goog.module statements
        headerStmts.push(tslibImport);
      }

      // Insert goog.module() etc after any leading comments in the source file.
      // The comments have been converted to NotEmittedStatements by
      // transformer_util, which this depends on.
      const insertionIdx =
          stmts.findIndex(s => s.kind !== ts.SyntaxKind.NotEmittedStatement);
      if (insertionIdx === -1) {
        stmts.push(...headerStmts);
      } else {
        stmts.splice(insertionIdx, 0, ...headerStmts);
      }

      return ts.factory.updateSourceFile(
          sf,
          ts.setTextRange(ts.factory.createNodeArray(stmts), sf.statements));
    };
  };
}

/**
 * Allow code to use `module.id` to discover its module URL, e.g. to resolve a
 * template URL against. Does not add `module.id` if a `module` symbol is
 * already declared at the top-level in `sourceFile`.
 *
 * Uses 'var', as this code is inserted in ES6 and ES5 modes. The following
 * pattern ensures closure doesn't throw an error in advanced optimizations
 * mode:
 *
 * ```
 * var module = module || {id: 'path/to/module.ts'};
 * ```
 */
function maybeAddModuleId(
    host: GoogModuleProcessorHost, typeChecker: ts.TypeChecker,
    sourceFile: ts.SourceFile, headerStmts: ts.Statement[]): void {
  // See if a top-level 'module' symbol exists in the source file.
  const moduleSymbol: ts.Symbol|undefined =
      typeChecker.getSymbolsInScope(sourceFile, ts.SymbolFlags.ModuleMember)
          ?.find(s => s.name === 'module');
  if (moduleSymbol) {
    const declaration =
        moduleSymbol.valueDeclaration ?? moduleSymbol.declarations?.[0];

    // If a top-level symbol with the name `module` exists whose value is
    // declared in sourceFile, don't add the `module.id` symbol.
    if (sourceFile.fileName === declaration?.getSourceFile().fileName) return;
  }

  const moduleId = host.fileNameToModuleId(sourceFile.fileName);
  const moduleVarInitializer = ts.factory.createBinaryExpression(
      ts.factory.createIdentifier('module'), ts.SyntaxKind.BarBarToken,
      ts.factory.createObjectLiteralExpression(
          [ts.factory.createPropertyAssignment(
              'id', createSingleQuoteStringLiteral(moduleId))]));
  const modAssign = ts.factory.createVariableStatement(
      /* modifiers= */ undefined,
      ts.factory.createVariableDeclarationList(
          [ts.factory.createVariableDeclaration(
              'module', /* exclamationToken= */ undefined,
              /* type= */ undefined, moduleVarInitializer)]));
  headerStmts.push(modAssign);
}
