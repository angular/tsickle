/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {SourceMapper, SourcePosition} from './source_map_utils';
import {isTypeNodeKind, updateSourceFileNode, visitEachChildIgnoringTypes, visitNodeWithSynthesizedComments} from './transformer_util';

/**
 * @fileoverview Creates a TypeScript transformer that parses code into a new `ts.SourceFile`,
 * marks the nodes as synthetic and where possible maps the new nodes back to the original nodes
 * via sourcemap information.
 */
export function createTransformerFromSourceMap(
    operator: (sourceFile: ts.SourceFile, sourceMapper: SourceMapper) =>
        string): ts.TransformerFactory<ts.SourceFile> {
  return (context) => (sourceFile) => {
    const sourceMapper = new NodeSourceMapper();
    const newFile = ts.createSourceFile(
        sourceFile.fileName, operator(sourceFile, sourceMapper), ts.ScriptTarget.Latest, true);
    const mappedFile = visitNode(newFile);
    return updateSourceFileNode(sourceFile, mappedFile.statements);

    function visitNode<T extends ts.Node>(node: T): T {
      return visitNodeWithSynthesizedComments(context, newFile, node, visitNodeImpl) as T;
    }

    function visitNodeImpl(node: ts.Node) {
      if (node.flags & ts.NodeFlags.Synthesized) {
        return node;
      }
      const originalNode = sourceMapper.getOriginalNode(node);

      // Use the originalNode for:
      // - literals: as e.g. typescript does not support synthetic regex literals
      // - identifiers: as they don't have children and behave well
      //    regarding comment synthesization
      // - types: as they are not emited anyways
      //          and it leads to errors with `extends` cases.
      if (originalNode &&
          (isLiteralKind(node.kind) || node.kind === ts.SyntaxKind.Identifier ||
           isTypeNodeKind(node.kind) || node.kind === ts.SyntaxKind.IndexSignature)) {
        return originalNode;
      }
      node = visitEachChildIgnoringTypes(node, visitNode, context);

      node.flags |= ts.NodeFlags.Synthesized;
      node.parent = undefined;
      ts.setTextRange(node, originalNode ? originalNode : {pos: -1, end: -1});
      ts.setOriginalNode(node, originalNode);

      // Loop over all nested ts.NodeArrays /
      // ts.Nodes that were not visited and set their
      // text range to -1 to not emit their whitespace.
      // Sadly, TypeScript does not have an API for this...
      // tslint:disable-next-line:no-any To read all properties
      const nodeAny = node as {[key: string]: any};
      // tslint:disable-next-line:no-any To read all properties
      const originalNodeAny = originalNode as {[key: string]: any};
      for (const prop in nodeAny) {
        if (nodeAny.hasOwnProperty(prop)) {
          // tslint:disable-next-line:no-any
          const value = nodeAny[prop];
          if (isNodeArray(value)) {
            // reset the pos/end of all NodeArrays so that we don't emit comments
            // from them.
            ts.setTextRange(value, {pos: -1, end: -1});
          } else if (
              isToken(value) && !(value.flags & ts.NodeFlags.Synthesized) &&
              value.getSourceFile() !== sourceFile) {
            // Use the original TextRange for all non visited tokens (e.g. the
            // `BinaryExpression.operatorToken`) to preserve the formatting
            const textRange = originalNode ? originalNodeAny[prop] : {pos: -1, end: -1};
            ts.setTextRange(value, textRange);
          }
        }
      }

      return node;
    }
  };
}

/**
 * Implementation of the `SourceMapper` that stores and retrieves mappings
 * to original nodes.
 */
class NodeSourceMapper implements SourceMapper {
  private originalNodeByGeneratedRange = new Map<string, ts.Node>();
  private genStartPositions = new Map<ts.Node, number>();

  private addFullNodeRange(node: ts.Node, genStartPos: number) {
    this.originalNodeByGeneratedRange.set(
        this.nodeCacheKey(node.kind, genStartPos, genStartPos + (node.getEnd() - node.getStart())),
        node);
    node.forEachChild(
        child => this.addFullNodeRange(child, genStartPos + (child.getStart() - node.getStart())));
  }

  addMapping(
      originalNode: ts.Node, original: SourcePosition, generated: SourcePosition, length: number) {
    let originalStartPos = original.position;
    let genStartPos = generated.position;
    if (originalStartPos >= originalNode.getFullStart() &&
        originalStartPos <= originalNode.getStart()) {
      // always use the node.getStart() for the index,
      // as comments and whitespaces might differ between the original and transformed code.
      const diffToStart = originalNode.getStart() - originalStartPos;
      originalStartPos += diffToStart;
      genStartPos += diffToStart;
      length -= diffToStart;
      this.genStartPositions.set(originalNode, genStartPos);
    }
    if (originalStartPos + length === originalNode.getEnd()) {
      this.originalNodeByGeneratedRange.set(
          this.nodeCacheKey(
              originalNode.kind, this.genStartPositions.get(originalNode)!, genStartPos + length),
          originalNode);
    }
    originalNode.forEachChild((child) => {
      if (child.getStart() >= originalStartPos && child.getEnd() <= originalStartPos + length) {
        this.addFullNodeRange(child, genStartPos + (child.getStart() - originalStartPos));
      }
    });
  }

  getOriginalNode(node: ts.Node): ts.Node|undefined {
    return this.originalNodeByGeneratedRange.get(
        this.nodeCacheKey(node.kind, node.getStart(), node.getEnd()));
  }

  private nodeCacheKey(kind: ts.SyntaxKind, start: number, end: number): string {
    return `${kind}#${start}#${end}`;
  }
}

// tslint:disable-next-line:no-any
function isNodeArray(value: any): value is ts.NodeArray<any> {
  const anyValue = value;
  return Array.isArray(value) && anyValue.pos !== undefined && anyValue.end !== undefined;
}

// tslint:disable-next-line:no-any
function isToken(value: any): value is ts.Token<any> {
  return value != null && typeof value === 'object' && value.kind >= ts.SyntaxKind.FirstToken &&
      value.kind <= ts.SyntaxKind.LastToken;
}

// Copied from TypeScript
function isLiteralKind(kind: ts.SyntaxKind) {
  return ts.SyntaxKind.FirstLiteralToken <= kind && kind <= ts.SyntaxKind.LastLiteralToken;
}
