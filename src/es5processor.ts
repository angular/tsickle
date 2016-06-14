import * as ts from 'typescript';

import {Rewriter, getIdentifierText} from './rewriter';

/**
 * ES5Processor postprocesses TypeScript compilation output JS, to rewrite commonjs require()s into
 * goog.require().
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
  namespaceImports: {[varName: string]: boolean} = {};

  /**
   * moduleVariables maps from module names to the variables they're assigned to.
   * Continuing the above example, moduleVariables['goog.bar'] = 'foo'.
   */
  moduleVariables: {[moduleName: string]: string} = {};

  /** strippedStrict is true once we've stripped a "use strict"; from the input. */
  strippedStrict: boolean = false;

  /** unusedIndex is used to generate fresh symbols for unnamed imports. */
  unusedIndex: number = 0;

  constructor(
      file: ts.SourceFile,
      private pathToModuleName: (context: string, fileName: string) => string) {
    super(file);
  }

  process(): {output: string, referencedModules: string[]} {
    // TODO(evanm): only emit the goog.module *after* the first comment,
    // so that @suppress statements work.
    const moduleName = this.pathToModuleName('', this.file.fileName);
    // NB: No linebreak after module call so sourcemaps are not offset.
    this.emit(`goog.module('${moduleName}');`);
    // Allow code to use `module.id` to discover its module URL, e.g. to resolve
    // a template URL against.
    // Uses 'var', as this code is inserted in ES6 and ES5 modes.
    this.emit(`var module = module || {id: '${this.file.fileName}'};`);

    let pos = 0;
    for (let stmt of this.file.statements) {
      this.writeRange(pos, stmt.getFullStart());
      this.visitTopLevel(stmt);
      pos = stmt.getEnd();
    }
    this.writeRange(pos, this.file.getEnd());

    let referencedModules = Object.keys(this.moduleVariables);
    // Note: don't sort referencedModules, as the keys are in the same order
    // they occur in the source file.
    let {output} = this.getOutput();
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
          this.writeRange(node.getFullStart(), node.getStart());
          this.strippedStrict = true;
          return;
        }
        // Check for:
        // - "require('foo');" (a require for its side effects)
        // - "__export(require(...));" (an "export * from ...")
        if (this.emitRewrittenRequires(node)) {
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

  /** isUseStrict returns true if node is a "use strict"; statement. */
  isUseStrict(node: ts.Node): boolean {
    if (node.kind !== ts.SyntaxKind.ExpressionStatement) return false;
    let exprStmt = node as ts.ExpressionStatement;
    let expr = exprStmt.expression;
    if (expr.kind !== ts.SyntaxKind.StringLiteral) return false;
    let literal = expr as ts.StringLiteral;
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
    // Find the CallExpression contained in either of these.
    let varName: string;          // E.g. importName in the above example.
    let call: ts.CallExpression;  // The require(...) expression.
    if (node.kind === ts.SyntaxKind.VariableStatement) {
      // It's possibly of the form "var x = require(...);".
      let varStmt = node as ts.VariableStatement;

      // Verify it's a single decl (and not "var x = ..., y = ...;").
      if (varStmt.declarationList.declarations.length !== 1) return false;
      let decl = varStmt.declarationList.declarations[0];

      // Grab the variable name (avoiding things like destructuring binds).
      if (decl.name.kind !== ts.SyntaxKind.Identifier) return false;
      varName = getIdentifierText(decl.name as ts.Identifier);
      if (!decl.initializer || decl.initializer.kind !== ts.SyntaxKind.CallExpression) return false;
      call = decl.initializer as ts.CallExpression;
    } else if (node.kind === ts.SyntaxKind.ExpressionStatement) {
      // It's possibly of the form:
      // - require(...);
      // - __export(require(...));
      // Both are CallExpressions.
      let exprStmt = node as ts.ExpressionStatement;
      let expr = exprStmt.expression;
      if (expr.kind !== ts.SyntaxKind.CallExpression) return false;
      call = expr as ts.CallExpression;

      let require = this.isExportRequire(call);
      if (require) {
        let modName = this.pathToModuleName(this.file.fileName, require);
        this.writeRange(node.getFullStart(), node.getStart());
        this.emit(`__export(goog.require('${modName}'));`);
        // Mark that this module was imported; it doesn't have an associated
        // variable so just call the variable "*".
        this.moduleVariables[modName] = '*';
        return true;
      }
    } else {
      // It's some other type of statement.
      return false;
    }

    let require = this.isRequire(call);
    if (!require) return false;

    // Even if it's a bare require(); statement, introduce a variable for it.
    // This avoids a Closure error.
    if (!varName) {
      varName = `unused_${this.unusedIndex++}_`;
    }

    let modName: string;
    if (require.match(/^goog:/)) {
      // This is a namespace import, of the form "goog:foo.bar".
      // Fix it to just "foo.bar", and save the variable name.
      modName = require.substr(5);
      this.namespaceImports[varName] = true;
    } else {
      modName = this.pathToModuleName(this.file.fileName, require);
    }

    this.writeRange(node.getFullStart(), node.getStart());
    if (this.moduleVariables.hasOwnProperty(modName)) {
      this.emit(`var ${varName} = ${this.moduleVariables[modName]};`);
    } else {
      this.emit(`var ${varName} = goog.require('${modName}');`);
      this.moduleVariables[modName] = varName;
    }
    return true;
  }
  // workaround for syntax highlighting bug in Sublime: `

  /**
   * Returns the string argument if call is of the form
   *   require('foo')
   */
  isRequire(call: ts.CallExpression): string {
    // Verify that the call is a call to require(...).
    if (call.expression.kind !== ts.SyntaxKind.Identifier) return null;
    let ident = call.expression as ts.Identifier;
    if (getIdentifierText(ident) !== 'require') return null;

    // Verify the call takes a single string argument and grab it.
    if (call.arguments.length !== 1) return null;
    let arg = call.arguments[0];
    if (arg.kind !== ts.SyntaxKind.StringLiteral) return null;
    return (arg as ts.StringLiteral).text;
  }

  /**
   * Returns the inner string if call is of the form
   *   __export(require('foo'))
   */
  isExportRequire(call: ts.CallExpression): string {
    if (call.expression.kind !== ts.SyntaxKind.Identifier) return null;
    let ident = call.expression as ts.Identifier;
    if (ident.getText() !== '__export') return null;

    // Verify the call takes a single string argument and grab it.
    if (call.arguments.length !== 1) return null;
    let arg = call.arguments[0];
    if (arg.kind !== ts.SyntaxKind.CallExpression) return null;
    return this.isRequire(arg as ts.CallExpression);
  }

  /**
   * maybeProcess is called during the recursive traversal of the program's AST.
   *
   * @return True if the node was processed/emitted, false if it should be emitted as is.
   */
  protected maybeProcess(node: ts.Node): boolean {
    switch (node.kind) {
      case ts.SyntaxKind.PropertyAccessExpression:
        let propAccess = node as ts.PropertyAccessExpression;
        // We're looking for an expression of the form:
        //   module_name_var.default
        if (getIdentifierText(propAccess.name) !== 'default') break;
        if (propAccess.expression.kind !== ts.SyntaxKind.Identifier) break;
        let lhs = getIdentifierText(propAccess.expression as ts.Identifier);
        if (!this.namespaceImports.hasOwnProperty(lhs)) break;
        // Emit the same expression, with spaces to replace the ".default" part
        // so that source maps still line up.
        this.writeRange(node.getFullStart(), node.getStart());
        this.emit(`${lhs}        `);
        return true;
      default:
        break;
    }
    return false;
  }
}

/**
 * Converts TypeScript's JS+CommonJS output to Closure goog.module etc.
 * For use as a postprocessing step *after* TypeScript emits JavaScript.
 *
 * @param fileName The source file name, without an extension.
 * @param pathToModuleName A function that maps a filesystem .ts path to a
 *     Closure module name, as found in a goog.require('...') statement.
 *     The context parameter is the referencing file, used for resolving
 *     imports with relative paths like "import * as foo from '../foo';".
 */
export function processES5(
    fileName: string, content: string, pathToModuleName: (context: string, fileName: string) =>
                                           string): {output: string, referencedModules: string[]} {
  let file = ts.createSourceFile(fileName, content, ts.ScriptTarget.ES5, true);
  return new ES5Processor(file, pathToModuleName).process();
}
