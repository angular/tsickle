/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ModulesManifest} from './modules_manifest';
import {getIdentifierText, Rewriter} from './rewriter';
import {isDtsFileName} from './tsickle';
import {toArray} from './util';

export interface Es5ProcessorHost {
  /**
   * Takes a context (the current file) and the path of the file to import
   *  and generates a googmodule module name
   */
  pathToModuleName(context: string, importPath: string): string;
  /**
   * If we do googmodule processing, we polyfill module.id, since that's
   * part of ES6 modules.  This function determines what the module.id will be
   * for each file.
   */
  fileNameToModuleId(fileName: string): string;
  /** Whether to convert CommonJS module syntax to `goog.module` Closure imports. */
  googmodule?: boolean;
  /** Whether the emit targets ES5 or ES6+. */
  es5Mode?: boolean;
  /**
   * An additional prelude to insert in front of the emitted code, e.g. to import a shared library.
   */
  prelude?: string;
}

/**
 * Extracts the namespace part of a goog: import, or returns null if the given
 * import is not a goog: import.
 */
export function extractGoogNamespaceImport(tsImport: string): string|null {
  if (tsImport.match(/^goog:/)) return tsImport.substring('goog:'.length);
  return null;
}

/**
 * ES5Processor postprocesses TypeScript compilation output JS, to rewrite commonjs require()s into
 * goog.require(). Contrary to its name it handles converting the modules in both ES5 and ES6
 * outputs.
 */
class ES5Processor extends Rewriter {
  /**
   * namespaceImports collects the variables for imported goog.modules.
   * If the original TS input is:
   *   import foo from 'goog:bar';
   * then TS produces:
   *   var foo = require('goog:bar');
   * and this class rewrites it to:
   *   var foo = require('goog.bar');
   * After this step, namespaceImports['foo'] is true.
   * (This is used to rewrite 'foo.default' into just 'foo'.)
   */
  namespaceImports = new Set<string>();

  /**
   * moduleVariables maps from module names to the variables they're assigned to.
   * Continuing the above example, moduleVariables['goog.bar'] = 'foo'.
   */
  moduleVariables = new Map<string, string>();

  /** strippedStrict is true once we've stripped a "use strict"; from the input. */
  strippedStrict = false;

  /** unusedIndex is used to generate fresh symbols for unnamed imports. */
  unusedIndex = 0;

  constructor(private host: Es5ProcessorHost, file: ts.SourceFile) {
    super(file);
  }

  process(): {output: string, referencedModules: string[]} {
    const moduleId = this.host.fileNameToModuleId(this.file.fileName);
    // TODO(evanm): only emit the goog.module *after* the first comment,
    // so that @suppress statements work.
    const moduleName = this.host.pathToModuleName('', this.file.fileName);
    // NB: No linebreak after module call so sourcemaps are not offset.
    this.emit(`goog.module('${moduleName}');`);
    if (this.host.prelude) this.emit(this.host.prelude);
    // Allow code to use `module.id` to discover its module URL, e.g. to resolve
    // a template URL against.
    // Uses 'var', as this code is inserted in ES6 and ES5 modes.
    // The following pattern ensures closure doesn't throw an error in advanced
    // optimizations mode.
    if (this.host.es5Mode) {
      this.emit(`var module = module || {id: '${moduleId}'};`);
    } else {
      // The `exports = {}` serves as a default export to disable Closure Compiler's error checking
      // for mutable exports. That's OK because TS compiler makes sure that consuming code always
      // accesses exports through the module object, so mutable exports work.
      // It is only inserted in ES6 because we strip `.default` accesses in ES5 mode, which breaks
      // when assigning an `exports = {}` object and then later accessing it.
      this.emit(` exports = {}; var module = {id: '${moduleId}'};`);
    }

    let pos = 0;
    for (const stmt of this.file.statements) {
      this.writeRange(this.file, pos, stmt.getFullStart());
      this.visitTopLevel(stmt);
      pos = stmt.getEnd();
    }
    this.writeRange(this.file, pos, this.file.getEnd());

    const referencedModules = toArray(this.moduleVariables.keys());
    // Note: don't sort referencedModules, as the keys are in the same order
    // they occur in the source file.
    const {output} = this.getOutput();
    return {output, referencedModules};
  }

  /**
   * visitTopLevel processes a top-level ts.Node and emits its contents.
   *
   * It's separate from the normal Rewriter recursive traversal
   * because some top-level statements are handled specially.
   */
  visitTopLevel(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.ExpressionStatement:
        // Check for "use strict" and skip it if necessary.
        if (!this.strippedStrict && this.isUseStrict(node)) {
          this.emitCommentWithoutStatementBody(node);
          this.strippedStrict = true;
          return;
        }
        // Check for:
        // - "require('foo');" (a require for its side effects)
        // - "__export(require(...));" (an "export * from ...")
        if (this.emitRewrittenRequires(node)) {
          return;
        }
        // Check for
        //   Object.defineProperty(exports, "__esModule", ...);
        if (this.isEsModuleProperty(node as ts.ExpressionStatement)) {
          this.emitCommentWithoutStatementBody(node);
          return;
        }
        // Otherwise fall through to default processing.
        break;
      case ts.SyntaxKind.VariableStatement:
        // Check for a "var x = require('foo');".
        if (this.emitRewrittenRequires(node)) return;
        break;
      default:
        break;
    }
    this.visit(node);
  }

  /**
   * The TypeScript AST attaches comments to statement nodes, so even if a node
   * contains code we want to skip emitting, we need to emit the attached
   * comment(s).
   */
  emitCommentWithoutStatementBody(node: ts.Node) {
    this.writeLeadingTrivia(node);
  }

  /** isUseStrict returns true if node is a "use strict"; statement. */
  isUseStrict(node: ts.Node): boolean {
    if (node.kind !== ts.SyntaxKind.ExpressionStatement) return false;
    const exprStmt = node as ts.ExpressionStatement;
    const expr = exprStmt.expression;
    if (expr.kind !== ts.SyntaxKind.StringLiteral) return false;
    const literal = expr as ts.StringLiteral;
    return literal.text === 'use strict';
  }

  /**
   * emitRewrittenRequires rewrites require()s into goog.require() equivalents.
   *
   * @return True if the node was rewritten, false if needs ordinary processing.
   */
  emitRewrittenRequires(node: ts.Node): boolean {
    // We're looking for requires, of one of the forms:
    // - "var importName = require(...);".
    // - "require(...);".
    if (node.kind === ts.SyntaxKind.VariableStatement) {
      // It's possibly of the form "var x = require(...);".
      const varStmt = node as ts.VariableStatement;

      // Verify it's a single decl (and not "var x = ..., y = ...;").
      if (varStmt.declarationList.declarations.length !== 1) return false;
      const decl = varStmt.declarationList.declarations[0];

      // Grab the variable name (avoiding things like destructuring binds).
      if (decl.name.kind !== ts.SyntaxKind.Identifier) return false;
      const varName = getIdentifierText(decl.name as ts.Identifier);
      if (!decl.initializer || decl.initializer.kind !== ts.SyntaxKind.CallExpression) return false;
      const call = decl.initializer as ts.CallExpression;
      const require = this.isRequire(call);
      if (!require) return false;
      this.writeLeadingTrivia(node);
      this.emitGoogRequire(varName, require);
      return true;
    } else if (node.kind === ts.SyntaxKind.ExpressionStatement) {
      // It's possibly of the form:
      // - require(...);
      // - __export(require(...));
      // Both are CallExpressions.
      const exprStmt = node as ts.ExpressionStatement;
      const expr = exprStmt.expression;
      if (expr.kind !== ts.SyntaxKind.CallExpression) return false;
      const call = expr as ts.CallExpression;

      let require = this.isRequire(call);
      let isExport = false;
      if (!require) {
        // If it's an __export(require(...)), we emit:
        //   var x = require(...);
        //   __export(x);
        // This extra variable is necessary in case there's a later import of the
        // same module name.
        require = this.isExportRequire(call);
        isExport = require != null;
      }
      if (!require) return false;

      this.writeLeadingTrivia(node);
      const varName = this.emitGoogRequire(null, require);

      if (isExport) {
        this.emit(`__export(${varName});`);
      }
      return true;
    } else {
      // It's some other type of statement.
      return false;
    }
  }

  /**
   * Emits a goog.require() statement for a given variable name and TypeScript import.
   *
   * E.g. from:
   *   var varName = require('tsImport');
   * produces:
   *   var varName = goog.require('goog.module.name');
   *
   * If the input varName is null, generates a new variable name if necessary.
   *
   * @return The variable name for the imported module, reusing a previous import if one
   *    is available.
   */
  emitGoogRequire(varName: string|null, tsImport: string): string {
    let modName: string;
    let isNamespaceImport = false;
    const nsImport = extractGoogNamespaceImport(tsImport);
    if (nsImport !== null) {
      // This is a namespace import, of the form "goog:foo.bar".
      // Fix it to just "foo.bar".
      modName = nsImport;
      isNamespaceImport = true;
    } else {
      modName = this.host.pathToModuleName(this.file.fileName, tsImport);
    }

    if (!varName) {
      const mv = this.moduleVariables.get(modName);
      if (mv) {
        // Caller didn't request a specific variable name and we've already
        // imported the module, so just return the name we already have for this module.
        return mv;
      }

      // Note: we always introduce a variable for any import, regardless of whether
      // the caller requested one.  This avoids a Closure error.
      varName = this.generateFreshVariableName();
    }

    if (isNamespaceImport) this.namespaceImports.add(varName);
    if (this.moduleVariables.has(modName)) {
      this.emit(`var ${varName} = ${this.moduleVariables.get(modName)};`);
    } else {
      this.emit(`var ${varName} = goog.require('${modName}');`);
      this.moduleVariables.set(modName, varName);
    }
    return varName;
  }
  // workaround for syntax highlighting bug in Sublime: `

  /**
   * Returns the string argument if call is of the form
   *   require('foo')
   */
  isRequire(call: ts.CallExpression): string|null {
    // Verify that the call is a call to require(...).
    if (call.expression.kind !== ts.SyntaxKind.Identifier) return null;
    const ident = call.expression as ts.Identifier;
    if (getIdentifierText(ident) !== 'require') return null;

    // Verify the call takes a single string argument and grab it.
    if (call.arguments.length !== 1) return null;
    const arg = call.arguments[0];
    if (arg.kind !== ts.SyntaxKind.StringLiteral) return null;
    return (arg as ts.StringLiteral).text;
  }

  /**
   * Returns the inner string if call is of the form
   *   __export(require('foo'))
   */
  isExportRequire(call: ts.CallExpression): string|null {
    if (call.expression.kind !== ts.SyntaxKind.Identifier) return null;
    const ident = call.expression as ts.Identifier;
    if (ident.getText() !== '__export') return null;

    // Verify the call takes a single call argument and check it.
    if (call.arguments.length !== 1) return null;
    const arg = call.arguments[0];
    if (arg.kind !== ts.SyntaxKind.CallExpression) return null;
    return this.isRequire(arg as ts.CallExpression);
  }

  isEsModuleProperty(expr: ts.ExpressionStatement): boolean {
    // We're matching the explicit source text generated by the TS compiler.
    return expr.getText() === 'Object.defineProperty(exports, "__esModule", { value: true });';
  }

  /**
   * maybeProcess is called during the recursive traversal of the program's AST.
   *
   * @return True if the node was processed/emitted, false if it should be emitted as is.
   */
  protected maybeProcess(node: ts.Node): boolean {
    switch (node.kind) {
      case ts.SyntaxKind.PropertyAccessExpression:
        const propAccess = node as ts.PropertyAccessExpression;
        // We're looking for an expression of the form:
        //   module_name_var.default
        if (getIdentifierText(propAccess.name) !== 'default') break;
        if (propAccess.expression.kind !== ts.SyntaxKind.Identifier) break;
        const lhs = getIdentifierText(propAccess.expression as ts.Identifier);
        if (!this.namespaceImports.has(lhs)) break;
        // Emit the same expression, with spaces to replace the ".default" part
        // so that source maps still line up.
        this.writeLeadingTrivia(node);
        this.emit(`${lhs}        `);
        return true;
      default:
        break;
    }
    return false;
  }

  /** Generates a new variable name inside the tsickle_ namespace. */
  generateFreshVariableName(): string {
    return `tsickle_module_${this.unusedIndex++}_`;
  }
}

/**
 * Converts TypeScript's JS+CommonJS output to Closure goog.module etc.
 * For use as a postprocessing step *after* TypeScript emits JavaScript.
 *
 * @param fileName The source file name.
 * @param moduleId The "module id", a module-identifying string that is
 *     the value module.id in the scope of the module.
 * @param pathToModuleName A function that maps a filesystem .ts path to a
 *     Closure module name, as found in a goog.require('...') statement.
 *     The context parameter is the referencing file, used for resolving
 *     imports with relative paths like "import * as foo from '../foo';".
 * @param prelude An additional prelude to insert after the `goog.module` call,
 *     e.g. with additional imports or requires.
 */
export function processES5(host: Es5ProcessorHost, fileName: string, content: string):
    {output: string, referencedModules: string[]} {
  const file = ts.createSourceFile(fileName, content, ts.ScriptTarget.ES5, true);
  return new ES5Processor(host, file).process();
}

export function convertCommonJsToGoogModuleIfNeeded(
    host: Es5ProcessorHost, modulesManifest: ModulesManifest, fileName: string,
    content: string): string {
  if (!host.googmodule || isDtsFileName(fileName)) {
    return content;
  }
  const {output, referencedModules} = processES5(host, fileName, content);

  const moduleName = host.pathToModuleName('', fileName);
  modulesManifest.addModule(fileName, moduleName);
  for (const referenced of referencedModules) {
    modulesManifest.addReferencedModule(fileName, referenced);
  }

  return output;
}
