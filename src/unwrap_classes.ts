/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

// Removes TS3.9 wrappers around classes that contained decorators and/or static properties
// Before:
// let DecoratedClass = /** @class */ (() => {
//   let DecoratedClass = class DecoratedClass {
//   };
//   DecoratedClass = __decorate([
//       classDecorator
//   ], DecoratedClass);
//   return DecoratedClass;
// })();
//
// After:
// let DecoratedClass = class DecoratedClass {
// };
// DecoratedClass = __decorate([
//     classDecorator
// ], DecoratedClass);
//
// OR
//
// Before:
// let StaticClass = /** @class */ (() => {
//   class StaticClass {
//   }
//   StaticClass.x = 123;
//   return StaticClass;
// })();
//
// After:
// class StaticClass {
// }
// StaticClass.x = 123;

export function removeClassWrappers(): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => {
    function visitor(node: ts.Node): ts.VisitResult<ts.Node> {
      const visitedNode = ts.visitEachChild(node, visitor, context);
      if (!ts.isVariableStatement(visitedNode)) {
        return visitedNode;
      }

      const wrappedContent = getWrappedClassContent(visitedNode);

      return wrappedContent || visitedNode;
    }

    return (sf: ts.SourceFile) => ts.visitEachChild(sf, visitor, context);
  };
}

function getWrappedClassContent(node: ts.VariableStatement): ts.Node[]|null {
  if (node.declarationList.declarations.length !== 1) {
    return null;
  }

  const variableDeclaration = node.declarationList.declarations[0];
  if (!ts.isIdentifier(variableDeclaration.name) || !variableDeclaration.initializer) {
    return null;
  }

  const potentialWrapper = variableDeclaration.initializer;
  if (!ts.isCallExpression(potentialWrapper) || potentialWrapper.arguments.length !== 0) {
    return null;
  }
  if (!ts.isParenthesizedExpression(potentialWrapper.expression)) {
    return null;
  }
  if (!ts.isArrowFunction(potentialWrapper.expression.expression)) {
    return null;
  }

  const wrapperBody = potentialWrapper.expression.expression.body;
  if (!ts.isBlock(wrapperBody)) {
    return null;
  }
  // Need a minimum of two for a class and return statement
  if (wrapperBody.statements.length < 2) {
    return null;
  }

  const functionStatements = [...wrapperBody.statements];
  const firstStatement = functionStatements[0];
  let className: string|undefined;
  if (ts.isVariableStatement(firstStatement)) {
    if (firstStatement.declarationList.declarations.length !== 1) {
      return null;
    }
    const innerDeclaration = firstStatement.declarationList.declarations[0];
    if (!ts.isIdentifier(innerDeclaration.name) || !innerDeclaration.initializer ||
        !ts.isClassExpression(innerDeclaration.initializer)) {
      return null;
    }
    if (innerDeclaration.name.text !== innerDeclaration.initializer.name?.text) {
      return null;
    }
    className = innerDeclaration.name.text;
  } else if (ts.isClassDeclaration(firstStatement)) {
    className = firstStatement.name ?.text;
  }

  if (!className) {
    return null;
  }

  // Find return statement
  let returnIndex: number|undefined;
  for (let i = functionStatements.length - 1; i > 0; i--) {
    if (ts.isReturnStatement(functionStatements[i])) {
      // more than one is not a wrapper
      if (returnIndex !== undefined) {
        return null;
      }

      returnIndex = i;
    } else if (
        returnIndex === undefined &&
        functionStatements[i].kind !== ts.SyntaxKind.NotEmittedStatement) {
      return null;
    }
  }

  if (returnIndex === undefined) {
    return null;
  }

  const returnStatement = functionStatements[returnIndex] as ts.ReturnStatement;
  if (!returnStatement.expression) {
    return null;
  }

  const returnExpression = ts.skipPartiallyEmittedExpressions(returnStatement.expression);
  if (!ts.isIdentifier(returnExpression)) {
    return null;
  }

  if (returnExpression.text !== className) {
    return null;
  }

  functionStatements.splice(returnIndex, 1);

  return functionStatements;
}
