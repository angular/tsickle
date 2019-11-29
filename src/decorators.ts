/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {getAllLeadingComments} from './transformer_util';

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
 * A transform pass that adds JSCompiler_renameProperty calls to the property
 * name string literals that are emitted as part of TypeScript's default
 * decorator output.
 *
 * JSCompiler_renameProperty is a special function that is recognized by
 * Closure Compiler. It is called like JSCompiler_renameProperty('prop', obj)
 * and it is compiled to a string literal that's the property named 'prop' on
 * the obj value.
 *
 * This way, runtime decorators can use the property names (e.g. to register
 * the property as a getter/setter pair) while still being compatible with
 * Closure Compiler's property renaming.
 */
export function transformDecoratorsOutputForClosurePropertyRenaming(
    context: ts.TransformationContext) {
  const result: ts.Transformer<ts.SourceFile> = (sourceFile: ts.SourceFile) => {
    let needsImportOfGoogReflect = false;
    const visitor: ts.Visitor = (node) => {
      const replacementNode = rewriteDecorator(node, context);
      if (replacementNode) {
        needsImportOfGoogReflect = true;
        return replacementNode;
      }
      return ts.visitEachChild(node, visitor, context);
    };
    const updatedSourceFile = ts.visitNode(sourceFile, visitor);
    if (needsImportOfGoogReflect) {
      const statements = [...updatedSourceFile.statements];
      const googModuleIndex = statements.findIndex(isGoogModuleStatement);
      const googRequireReflectObjectProeprty = ts.createVariableStatement(
          undefined,
          ts.createVariableDeclarationList(
              [ts.createVariableDeclaration(
                  '__googReflect', undefined,

                  ts.createCall(
                      ts.createPropertyAccess(ts.createIdentifier('goog'), 'require'), undefined,
                      [ts.createStringLiteral('goog.reflect')]))],
              ts.NodeFlags.Const));
      if (googModuleIndex !== -1) {
        statements.splice(googModuleIndex + 3, 0, googRequireReflectObjectProeprty);
      }
      updatedSourceFile.statements = ts.createNodeArray(statements);
    }
    return updatedSourceFile;
  };
  return result;
}

function rewriteDecorator(node: ts.Node, context: ts.TransformationContext): ts.Node|undefined {
  if (!ts.isCallExpression(node)) {
    return;
  }
  const identifier = node.expression;
  if (!ts.isIdentifier(identifier) || identifier.text !== '__decorate') {
    return;
  }
  const args = node.arguments;
  if (args.length !== 4) {
    return;
  }
  const untypedFieldNameLiteral = args[2];
  if (!ts.isStringLiteral(untypedFieldNameLiteral)) {
    return;
  }
  const fieldNameLiteral = untypedFieldNameLiteral;
  function replaceFieldName(node: ts.Node): ts.Node {
    if (node !== untypedFieldNameLiteral) {
      return ts.visitEachChild(node, replaceFieldName, context);
    }
    return ts.createCall(
        ts.createPropertyAccess(ts.createIdentifier('__googReflect'), 'objectProperty'), undefined,
        [ts.createStringLiteral(fieldNameLiteral.text), ts.getMutableClone(args[1])]);
  }
  return ts.visitNode(node, replaceFieldName);
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
