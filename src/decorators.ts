/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {getAllLeadingComments, reportDiagnostic} from './transformer_util';

/**
 * Returns the declarations for the given decorator.
 */
export function getDecoratorDeclarations(
    decorator: ts.Decorator, typeChecker: ts.TypeChecker): ts.Declaration[] {
  // Walk down the expression to find the identifier of the decorator function.
  let node: ts.Node = decorator;
  while (node.kind !== ts.SyntaxKind.Identifier) {
    if (node.kind === ts.SyntaxKind.Decorator || node.kind === ts.SyntaxKind.CallExpression) {
      node = (node as ts.Decorator | ts.CallExpression).expression;
    } else {
      // We do not know how to handle this type of decorator.
      return [];
    }
  }

  let decSym = typeChecker.getSymbolAtLocation(node);
  if (!decSym) return [];
  if (decSym.flags & ts.SymbolFlags.Alias) {
    decSym = typeChecker.getAliasedSymbol(decSym);
  }
  return decSym.getDeclarations() || [];
}

/**
 * Returns true if node has an exporting decorator  (i.e., a decorator with @ExportDecoratedItems
 * in its JSDoc).
 */
export function hasExportingDecorator(node: ts.Node, typeChecker: ts.TypeChecker) {
  return node.decorators &&
      node.decorators.some(decorator => isExportingDecorator(decorator, typeChecker));
}

/**
 * Returns true if the given decorator has an @ExportDecoratedItems directive in its JSDoc.
 */
function isExportingDecorator(decorator: ts.Decorator, typeChecker: ts.TypeChecker) {
  return getDecoratorDeclarations(decorator, typeChecker).some(declaration => {
    const range = getAllLeadingComments(declaration);
    if (!range) {
      return false;
    }
    for (const {text} of range) {
      if (/@ExportDecoratedItems\b/.test(text)) {
        return true;
      }
    }
    return false;
  });
}

/**
 * A transform pass that adds goog.reflect.objectProperty calls to the property
 * name string literals that are emitted as part of TypeScript's default
 * decorator output.
 *
 * goog.reflect.objectProperty is a special function that is recognized by
 * Closure Compiler. It is called like goog.reflect.objectProperty('prop', obj)
 * and it is compiled to a string literal that's the property named 'prop' on
 * the obj value.
 *
 * This way, runtime decorators can use the property names (e.g. to register
 * the property as a getter/setter pair) while still being compatible with
 * Closure Compiler's property renaming.
 *
 * Transforms:
 *
 *     tslib_1.__decorate([
 *       decorator,
 *       tslib_1.__metadata("design:type", Object)
 *     ], Foo.prototype, "prop", void 0);
 *
 * Into:
 *
 *     tslib_1.__decorate([
 *           decorator,
 *           tslib_1.__metadata("design:type", Object)
 *         ], Foo.prototype,
 *         __googReflect.objectProperty("prop", Foo.prototype), void 0);
 */
export function transformDecoratorsOutputForClosurePropertyRenaming(diagnostics: ts.Diagnostic[]) {
  return (context: ts.TransformationContext) => {
    const result: ts.Transformer<ts.SourceFile> = (sourceFile: ts.SourceFile) => {
      let nodeNeedingGoogReflect: undefined|ts.Node = undefined;
      const visitor: ts.Visitor = (node) => {
        const replacementNode = rewriteDecorator(node, context);
        if (replacementNode) {
          nodeNeedingGoogReflect = node;
          return replacementNode;
        }
        return ts.visitEachChild(node, visitor, context);
      };
      let updatedSourceFile = ts.visitNode(sourceFile, visitor);
      if (nodeNeedingGoogReflect !== undefined) {
        const statements = [...updatedSourceFile.statements];
        const googModuleIndex = statements.findIndex(isGoogModuleStatement);
        if (googModuleIndex === -1) {
          reportDiagnostic(
              diagnostics, nodeNeedingGoogReflect,
              'Internal tsickle error: could not find goog.module statement to import __tsickle_googReflect for decorator compilation.');
          return sourceFile;
        }
        const googRequireReflectObjectProperty = ts.createVariableStatement(
            undefined,
            ts.createVariableDeclarationList(
                [ts.createVariableDeclaration(
                    '__tsickle_googReflect', undefined,

                    ts.createCall(
                        ts.createPropertyAccess(ts.createIdentifier('goog'), 'require'), undefined,
                        [ts.createStringLiteral('goog.reflect')]))],
                ts.NodeFlags.Const));
        // The boilerplate we produce has a goog.module line, then two related
        // lines dealing with the `module` variable. Insert our goog.require
        // after that to avoid visually breaking up the module info, and to be
        // with the rest of the goog.require statements.
        statements.splice(googModuleIndex + 3, 0, googRequireReflectObjectProperty);
        updatedSourceFile = ts.factory.updateSourceFile(
            updatedSourceFile, ts.setTextRange(ts.createNodeArray(statements), updatedSourceFile.statements),
            updatedSourceFile.isDeclarationFile, updatedSourceFile.referencedFiles,
            updatedSourceFile.typeReferenceDirectives, updatedSourceFile.hasNoDefaultLib,
            updatedSourceFile.libReferenceDirectives);
      }
      return updatedSourceFile;
    };
    return result;
  };
}

/**
 * If `node` is a call to the tslib __decorate function, this returns a modified
 * call with the string argument replaced with
 * `__tsickle_googReflect.objectProperty('prop', TheClass.prototype)`.
 *
 * Returns undefined if no modification is necessary.
 */
function rewriteDecorator(node: ts.Node, context: ts.TransformationContext): ts.Node|undefined {
  if (!ts.isCallExpression(node)) {
    return;
  }
  const identifier = node.expression;
  if (!ts.isIdentifier(identifier) || identifier.text !== '__decorate') {
    return;
  }
  const args = [...node.arguments];
  if (args.length !== 4) {
    // Some decorators, like class decorators, have fewer arguments, and don't
    // need help to be renaming-safe.
    return;
  }
  const untypedFieldNameLiteral = args[2];
  if (!ts.isStringLiteral(untypedFieldNameLiteral)) {
    // This is allowed, for example:
    //
    //     const prop = Symbol();
    //     class Foo {
    //       @decorate [prop] = 'val';
    //     }
    //
    // Nothing for us to do in that case.
    return;
  }
  const fieldNameLiteral = untypedFieldNameLiteral;
  args[2] = ts.createCall(
      ts.createPropertyAccess(ts.createIdentifier('__tsickle_googReflect'), 'objectProperty'),
      undefined, [ts.createStringLiteral(fieldNameLiteral.text), ts.getMutableClone(args[1])]);
  return ts.updateCall(node, node.expression, node.typeArguments, args);
}

function isGoogModuleStatement(statement: ts.Node) {
  if (!ts.isExpressionStatement(statement)) {
    return false;
  }
  const expr = statement.expression;
  if (!ts.isCallExpression(expr)) {
    return false;
  }
  if (!ts.isPropertyAccessExpression(expr.expression)) {
    return false;
  }
  const goog = expr.expression.expression;
  if (!ts.isIdentifier(goog)) {
    return false;
  }
  return goog.text === 'goog' && expr.expression.name.text === 'module';
}
