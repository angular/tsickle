/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {shouldLower} from './decorator-annotator';
import {visitEachChild} from './transformer_util';
import * as ts from './typescript';

/**
 * Creates the AST for the decorator field type annotation, which has the form
 * { type: Function, args?: any[] }[]
 */
function createClassDecoratorType() {
  const typeElements: ts.TypeElement[] = [];
  typeElements.push(ts.createPropertySignature(
      undefined, 'type', undefined,
      ts.createTypeReferenceNode(ts.createIdentifier('Function'), undefined), undefined));
  typeElements.push(ts.createPropertySignature(
      undefined, 'args', ts.createToken(ts.SyntaxKind.QuestionToken),
      ts.createArrayTypeNode(ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)), undefined));
  return ts.createArrayTypeNode(ts.createTypeLiteralNode(typeElements));
}

/**
 * Extracts the type of the decorator, as well as all the arguments passed to
 * the decorator.  Returns an AST with the form
 * { type: decorator, args: [arg1, arg2] }
 */
function extractMetadataFromSingleDecorator(decorator: ts.Decorator, diagnostics: ts.Diagnostic[]) {
  const metadataProperties: ts.ObjectLiteralElementLike[] = [];
  const expr = decorator.expression;
  switch (expr.kind) {
    case ts.SyntaxKind.Identifier:
      // The decorator was a plain @Foo.
      metadataProperties.push(ts.createPropertyAssignment('type', expr));
      break;
    case ts.SyntaxKind.CallExpression:
      // The decorator was a call, like @Foo(bar).
      const call = expr as ts.CallExpression;
      metadataProperties.push(ts.createPropertyAssignment('type', call.expression));
      if (call.arguments.length) {
        const args: ts.Expression[] = [];
        for (const arg of call.arguments) {
          args.push(arg);
        }
        const argsArrayLiteral = ts.createArrayLiteral(args);
        argsArrayLiteral.elements.hasTrailingComma = true;
        metadataProperties.push(ts.createPropertyAssignment('args', argsArrayLiteral));
      }
      break;
    default:
      diagnostics.push({
        file: decorator.getSourceFile(),
        start: decorator.getStart(),
        length: decorator.getEnd() - decorator.getStart(),
        messageText:
            `${ts.SyntaxKind[decorator.kind]} not implemented in gathering decorator metadata`,
        category: ts.DiagnosticCategory.Error,
        code: 0,
      });
      break;
  }
  return ts.createObjectLiteral(metadataProperties);
}

/**
 * Takes a list of decorator metadata object ASTs and produces an AST for a
 * static class property of an array of those metadata objects.
 */
function createDecoratorClassProperty(decoratorList: ts.ObjectLiteralExpression[]) {
  const modifier = ts.createToken(ts.SyntaxKind.StaticKeyword);
  const type = createClassDecoratorType();
  const initializer = ts.createArrayLiteral(decoratorList, true);
  initializer.elements.hasTrailingComma = true;
  return ts.createProperty(undefined, [modifier], 'decorators', undefined, type, initializer);
}

function isNameEqual(classMember: ts.ClassElement, name: string): boolean {
  if (classMember.name === undefined) {
    return false;
  }
  const id = classMember.name as ts.Identifier;
  return id.text === name;
}

/**
 * Inserts the decorator metadata property in the place that the old
 * decorator-annotator visitor would put it, so the unit tests don't have to
 * change.
 * TODO(lucassloan): remove this when all 3 properties are put in via
 * transformers
 */
function insertBeforeDecoratorProperties(
    classMembers: ts.NodeArray<ts.ClassElement>,
    decoratorMetadata: ts.PropertyDeclaration): ts.NodeArray<ts.ClassElement> {
  let insertionPoint = classMembers.findIndex(
      m => isNameEqual(m, 'ctorParameters') || isNameEqual(m, 'propDecorators'));
  if (insertionPoint === -1) {
    insertionPoint = classMembers.length - 1;
  }
  const members = [
    ...classMembers.slice(0, insertionPoint), decoratorMetadata,
    ...classMembers.slice(insertionPoint)
  ];
  return ts.setTextRange(ts.createNodeArray(members, classMembers.hasTrailingComma), classMembers);
}

export function classDecoratorDownlevelTransformer(
    typeChecker: ts.TypeChecker, diagnostics: ts.Diagnostic[]):
    (context: ts.TransformationContext) => ts.Transformer<ts.SourceFile> {
  return (context: ts.TransformationContext) => {
    const visitor: ts.Visitor = (node: ts.Node): ts.Node => {
      switch (node.kind) {
        case ts.SyntaxKind.ClassDeclaration:
          const cd = visitEachChild(node, visitor, context) as ts.ClassDeclaration;
          const decorators = cd.decorators;

          if (decorators === undefined || decorators.length === 0) return cd;

          const decoratorList = [];
          const decoratorsToKeep: ts.Decorator[] = [];
          for (const decorator of decorators) {
            if (shouldLower(decorator, typeChecker)) {
              decoratorList.push(extractMetadataFromSingleDecorator(decorator, diagnostics));
            } else {
              decoratorsToKeep.push(decorator);
            }
          }

          if (decoratorList.length === 0) return cd;

          const newClassDeclaration = ts.getMutableClone(cd);

          newClassDeclaration.members = insertBeforeDecoratorProperties(
              newClassDeclaration.members, createDecoratorClassProperty(decoratorList));

          newClassDeclaration.decorators =
              decoratorsToKeep.length ? ts.createNodeArray(decoratorsToKeep) : undefined;

          return newClassDeclaration;
        default:
          return visitEachChild(node, visitor, context);
      }
    };

    return (sf: ts.SourceFile) => visitor(sf) as ts.SourceFile;
  };
}