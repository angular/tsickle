/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import * as jsdoc from './jsdoc';
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
  const decorators = ts.canHaveDecorators(node) ? ts.getDecorators(node) : [];

  return decorators &&
      decorators.some(
          decorator => isExportingDecorator(decorator, typeChecker));
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
        const replacementNode = rewriteDecorator(node);
        if (replacementNode) {
          nodeNeedingGoogReflect = node;
          return replacementNode;
        }
        return ts.visitEachChild(node, visitor, context);
      };
      let updatedSourceFile =
          // TODO: go/ts50upgrade - Remove after upgrade.
          // tslint:disable-next-line:no-unnecessary-type-assertion
          ts.visitNode(sourceFile, visitor, ts.isSourceFile)!;
      if (nodeNeedingGoogReflect !== undefined) {
        const statements = [...updatedSourceFile.statements];
        const googModuleIndex = statements.findIndex(isGoogModuleStatement);
        if (googModuleIndex === -1) {
          reportDiagnostic(
              diagnostics, nodeNeedingGoogReflect,
              'Internal tsickle error: could not find goog.module statement to import __tsickle_googReflect for decorator compilation.');
          return sourceFile;
        }
        const googRequireReflectObjectProperty =
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [ts.factory.createVariableDeclaration(
                        '__tsickle_googReflect',
                        /* exclamationToken */ undefined, /* type */ undefined,
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier('goog'), 'require'),
                            undefined,
                            [ts.factory.createStringLiteral('goog.reflect')]))],
                    ts.NodeFlags.Const));
        // The boilerplate we produce has a goog.module line, then two related
        // lines dealing with the `module` variable. Insert our goog.require
        // after that to avoid visually breaking up the module info, and to be
        // with the rest of the goog.require statements.
        statements.splice(googModuleIndex + 3, 0, googRequireReflectObjectProperty);
        updatedSourceFile = ts.factory.updateSourceFile(
            updatedSourceFile,
            ts.setTextRange(
                ts.factory.createNodeArray(statements),
                updatedSourceFile.statements),
            updatedSourceFile.isDeclarationFile,
            updatedSourceFile.referencedFiles,
            updatedSourceFile.typeReferenceDirectives,
            updatedSourceFile.hasNoDefaultLib,
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
function rewriteDecorator(node: ts.Node): ts.Node|undefined {
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
  args[2] = ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
          ts.factory.createIdentifier('__tsickle_googReflect'),
          'objectProperty'),
      undefined,
      [ts.factory.createStringLiteral(fieldNameLiteral.text), args[1]]);
  return ts.factory.updateCallExpression(
      node, node.expression, node.typeArguments, args);
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

const TAGS_CONFLICTING_WITH_DECORATE = new Set(['template', 'abstract']);

/**
 * Removes problematic annotations from JsDoc comments.
 */
function sanitizeDecorateComments(comments: ts.SynthesizedComment[]):
    ts.SynthesizedComment[] {
  const sanitized: ts.SynthesizedComment[] = [];
  for (const comment of comments) {
    const parsedComment: jsdoc.ParsedJSDocComment|null = jsdoc.parse(comment);
    if (parsedComment && parsedComment.tags.length !== 0) {
      const filteredTags = parsedComment.tags.filter(
          t => !(TAGS_CONFLICTING_WITH_DECORATE.has(t.tagName)));
      if (filteredTags.length !== 0) {
        sanitized.push(jsdoc.toSynthesizedComment(filteredTags));
      }
    }
  }
  return sanitized;
}

/**
 * A transformation pass that removes the annotations contained in
 * TAGS_CONFLICTING_WITH_DECORATE from toplevel statements of the form `ident =
 * tslib_1.__decorate(...)`.
 *
 * These call statements are generated for decorated classes and other
 * declarations. The leading comments of the declarations are cloned to the
 * `__decorate()` calls and may contain annotations that are not allowed in this
 * context and result in JSCompiler errors.
 */
export function transformDecoratorJsdoc():
    ts.TransformerFactory<ts.SourceFile> {
  return () => {
    const transformer: ts.Transformer<ts.SourceFile> =
        (sourceFile: ts.SourceFile) => {
          for (const stmt of sourceFile.statements) {
            // Only need to iterate over top-level statements in the source
            // file.
            if (!ts.isExpressionStatement(stmt)) continue;
            const expr = stmt.expression;
            if (!ts.isBinaryExpression(expr)) continue;
            if (expr.operatorToken.kind !== ts.SyntaxKind.EqualsToken) continue;
            const rhs = expr.right;
            if (!ts.isCallExpression(rhs)) continue;
            if (ts.isIdentifier(rhs.expression) &&
                (rhs.expression.text === '__decorate')) {
              const comments = ts.getSyntheticLeadingComments(stmt);
              if (!comments || comments.length === 0) {
                // Suppress visibility check for legacy decorators, otherwise
                // any decorated final class causes errors.
                ts.addSyntheticLeadingComment(
                    stmt, ts.SyntaxKind.MultiLineCommentTrivia,
                    '* @suppress {visibility} ',
                    /* trailing newline */ true);
              } else {
                // TODO(b/277272562): Remove this code path after TS5.1 is
                // released, as it no longer duplicates the original comments to
                // `ident = tslib_1.__decorate(...)` statements.
                ts.setSyntheticLeadingComments(
                    stmt, sanitizeDecorateComments(comments));
              }
            }
          }
          return sourceFile;
        };
    return transformer;
  };
}
