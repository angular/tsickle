/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {AnnotatorHost} from './jsdoc_transformer';
import {createSingleQuoteStringLiteral, reportDebugWarning} from './transformer_util';
import {isValidClosurePropertyName} from './type_translator';

/**
 * quotingTransformer warns on quoted accesses to declared properties, and converts dotted property
 * accesses on types with a string index type to element accesses (quoted accesses).
 */
// TODO(martinprobst): this code has surprising effects, and should probably rather generate an
// error than silently changing code semantics behind the scenes.
export function quotingTransformer(
    host: AnnotatorHost, typeChecker: ts.TypeChecker, diagnostics: ts.Diagnostic[]):
    (context: ts.TransformationContext) => ts.Transformer<ts.SourceFile> {
  return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    function visitor(node: ts.Node): ts.Node {
      switch (node.kind) {
        case ts.SyntaxKind.ElementAccessExpression:
          // Warn for quoted accesses to properties that have a symbol declared.
          // Mixing quoted and non-quoted access to a symbol (x['foo'] and x.foo) risks breaking
          // Closure Compiler renaming. Quoted access is more cumbersome to write than dotted access
          // though, so chances are users did intend to avoid renaming. The better fix is to use
          // `declare interface` though.
          const eae = node as ts.ElementAccessExpression;
          if (!eae.argumentExpression ||
              eae.argumentExpression.kind !== ts.SyntaxKind.StringLiteral) {
            break;
          }
          const quotedPropSym = typeChecker.getSymbolAtLocation(eae.argumentExpression);
          // If it has a symbol, it's actually a regular declared property.
          if (!quotedPropSym) break;
          const declarationHasQuotes =
              !quotedPropSym.declarations || quotedPropSym.declarations.some(d => {
                const decl = d as ts.NamedDeclaration;
                if (!decl.name) return false;
                return decl.name.kind === ts.SyntaxKind.StringLiteral;
              });
          // If the property is declared with quotes, it should also be accessed with them.
          if (declarationHasQuotes) break;
          const propName = (eae.argumentExpression as ts.StringLiteral).text;
          // Properties containing non-JS identifier names can only be accessed with quotes.
          if (!isValidClosurePropertyName(propName)) break;
          const symName = typeChecker.symbolToString(quotedPropSym);
          reportDebugWarning(
              host, eae,
              `Declared property ${symName} accessed with quotes. ` +
                  `This can lead to renaming bugs. A better fix is to use 'declare interface' ` +
                  `on the declaration.`);
          // Previously, the code below changed the quoted into a non-quoted access.
          // this.writeNode(eae.expression);
          // this.emit(`.${propName}`);
          break;
        case ts.SyntaxKind.PropertyAccessExpression:
          // Convert dotted accesses to types that have an index type declared to quoted accesses,
          // to avoid Closure renaming one access but not the other. This can happen because TS
          // allows dotted access to string index types.
          const pae = node as ts.PropertyAccessExpression;
          const t = typeChecker.getTypeAtLocation(pae.expression);
          if (!t.getStringIndexType()) break;
          // Types can have string index signatures and declared properties (of the matching type).
          // These properties have a symbol, as opposed to pure string index types.
          const propSym = typeChecker.getSymbolAtLocation(pae.name);
          // The decision to return below is a judgement call. Presumably, in most situations,
          // dotted access to a property is correct, and should not be turned into quoted access
          // even if there is a string index on the type. However it is possible to construct
          // programs where this is incorrect, e.g. where user code assigns into a property through
          // the index access in another location.
          if (propSym) break;

          reportDebugWarning(
              host, pae,
              typeChecker.typeToString(t) +
                  ` has a string index type but is accessed using dotted access. ` +
                  `Quoting the access.`);
          return ts.setOriginalNode(
              ts.createElementAccess(
                  ts.visitNode(pae.expression, visitor),
                  createSingleQuoteStringLiteral(pae.name.text)),
              node);
        default:
          break;
      }
      return ts.visitEachChild(node, visitor, context);
    }
    return (sourceFile: ts.SourceFile) => ts.visitEachChild(sourceFile, visitor, context);
  };
}
