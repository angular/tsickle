/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import * as transformerUtil from './transformer_util';

/** Returns the nearest ancestor node that's a function or method declaration. */
export function getContainingFunctionLikeDeclaration(node: ts.Node) {
  while (node) {
    if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) return node;
    node = node.parent;
  }
  return undefined;
}

/**
 * awaitTransformer returns a transformer factory that handles await statements after they
 * have been transformed. TypeScript down-levels await statements to code like:
 *     tslib_1.__awaiter(this, void 0, void 0, function* () { ... }
 *
 * The generator function ("function* ...") needs the appropriate `\@this` annotation for Closure,
 * which this transformer inserts.
 * 
 * This transformer is only needed (and only run by tsickle) when down-leveling await statements.
 *
 * @param thisTypeByAsyncFunction A map containing the context `this` type for all async function
 *     declarations. This is produced by jsdoc_transformer, as during that stage tsickle can insert
 *     imports and generally deals with types, whereas this code just post-processes TypeScript's
 *     emit.
 */
export function awaitTransformer(thisTypeByAsyncFunction: Map<ts.FunctionLikeDeclaration, string>):
    (context: ts.TransformationContext) => ts.Transformer<ts.SourceFile> {
  return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    return (sourceFile: ts.SourceFile) => {
      function visitAwaiterCall(awaiterCall: ts.CallExpression) {
        // __awaiter's last argument is always a function*() {...}
        const generatorFn = awaiterCall.arguments[3];
        if (!generatorFn || !ts.isFunctionExpression(generatorFn)) return;
        const fnDecl = getContainingFunctionLikeDeclaration(ts.getOriginalNode(generatorFn.body));
        if (!fnDecl) return;
        const thisType = thisTypeByAsyncFunction.get(fnDecl);
        if (!thisType) return;
        const comment: ts.SynthesizedComment = {
          kind: ts.SyntaxKind.MultiLineCommentTrivia,
          text: `* @this {${thisType}} `,
          pos: -1,
          end: -1,
        };
        const comments = ts.getSyntheticLeadingComments(generatorFn) || [];
        comments.push(comment);
        ts.setSyntheticLeadingComments(generatorFn, comments);
      }
      function visitor(node: ts.Node): ts.Node|ts.Node[] {
        // Find a call to __awaiter(this, ..., ..., *function() { original code }).
        // There is no access of "tslib.__awaiter" yet, the import access is inserted later on emit.
        if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) &&
            transformerUtil.getIdentifierText(node.expression) === '__awaiter') {
          visitAwaiterCall(node);
        }
        return ts.visitEachChild(node, visitor, context);
      }
      sourceFile = ts.visitEachChild(sourceFile, visitor, context);
      return sourceFile;
    };
  };
}
