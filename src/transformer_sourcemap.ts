/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SourceMapper, SourcePosition} from './source_map_utils';
import {isTypeNodeKind, updateSourceFileNode, visitNodeWithSynthesizedComments} from './transformer_util';
import * as ts from './typescript';

/**
 * Creates a TypeScript transformer based on a source->text transformation.
 *
 * TypeScript transformers operate on AST nodes. Newly created nodes must be marked as replacing an
 * older AST node. This shim allows running a transformation step that's based on emitting new text
 * as a node based transformer. It achieves that by running the transformation, collecting a source
 * mapping in the process, and then afterwards parsing the source text into a new AST and marking
 * the new nodes as representations of the old nodes based on their source map positions.
 *
 * The process marks all nodes as synthesized except for a handful of special cases (identifiers
 * etc).
 */
export function createTransformerFromSourceMap(
    sourceBasedTransformer: (sourceFile: ts.SourceFile, sourceMapper: SourceMapper) =>
        string): ts.TransformerFactory<ts.SourceFile> {
  return (context) => (sourceFile) => {
    const sourceMapper = new NodeSourceMapper();
    const transformedSourceText = sourceBasedTransformer(sourceFile, sourceMapper);
    const newFile = ts.createSourceFile(
        sourceFile.fileName, transformedSourceText, ts.ScriptTarget.Latest, true);
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
      // - imports/exports: as TypeScript will only attempt to elide type only
      //                    imports if the new node is identical to the original node.
      if (originalNode) {
        if (isLiteralKind(node.kind) || node.kind === ts.SyntaxKind.Identifier ||
            isTypeNodeKind(node.kind) || node.kind === ts.SyntaxKind.IndexSignature) {
          return originalNode;
        }
        if (node.kind === ts.SyntaxKind.ImportDeclaration ||
            node.kind === ts.SyntaxKind.ImportEqualsDeclaration ||
            node.kind === ts.SyntaxKind.ExportAssignment) {
          return originalNode;
        }
        if (ts.isExportDeclaration(node)) {
          // Return the original nodes for export declarations, unless they were expanded from an
          // export * to specific exported symbols.
          const originalExport = originalNode as ts.ExportDeclaration;
          if (!node.moduleSpecifier) {
            // export {a, b, c};
            return originalNode;
          }
          if (!!originalExport.exportClause === !!node.exportClause) {
            // This already was exported with symbols (export {...}) or was not expanded.
            return originalNode;
          }
          // Rewrote export * -> export {...}, the export declaration must be emitted in the updated
          // form.
        }
      }
      node = ts.visitEachChild(node, visitNode, context);

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
  /** Conceptual offset for all nodes in this mapping. */
  private offset = 0;

  /**
   * Recursively adds a source mapping for node and each of its children, mapping ranges from the
   * generated start position plus the child nodes offset up to its length.
   *
   * This is a useful catch all that works for most nodes, as long as their distance from the parent
   * does not change during emit and their own length does not change during emit (e.g. there are no
   * comments added inside them, no rewrites happening).
   */
  private addFullNodeRange(node: ts.Node, genStartPos: number) {
    this.originalNodeByGeneratedRange.set(
        this.nodeCacheKey(node.kind, genStartPos, genStartPos + (node.getEnd() - node.getStart())),
        node);
    node.forEachChild(
        child => this.addFullNodeRange(child, genStartPos + (child.getStart() - node.getStart())));
  }

  shiftByOffset(offset: number) {
    this.offset += offset;
  }

  /**
   * Adds a mapping for the specific start/end range in the generated output back to the
   * originalNode.
   */
  addMappingForRange(originalNode: ts.Node, startPos: number, endPos: number) {
    // TODO(martinprobst): This glaringly duplicates addMapping below. However attempting to unify
    // these causes failures around exported variable nodes. Additionally, inspecting this code
    // longer suggests that it really only barely works by accident, and should much rather be
    // replaced by proper transformers :-(
    const cc = this.nodeCacheKey(originalNode.kind, startPos, endPos);
    this.originalNodeByGeneratedRange.set(cc, originalNode);
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
      const cc = this.nodeCacheKey(
          originalNode.kind, this.genStartPositions.get(originalNode)!, genStartPos + length);
      this.originalNodeByGeneratedRange.set(cc, originalNode);
    }
    originalNode.forEachChild((child) => {
      if (child.getStart() >= originalStartPos && child.getEnd() <= originalStartPos + length) {
        this.addFullNodeRange(child, genStartPos + (child.getStart() - originalStartPos));
      }
    });
  }

  /** For the newly parsed `node`, find what node corresponded to it in the original source text. */
  getOriginalNode(node: ts.Node): ts.Node|undefined {
    // Apply the offset: if there is an offset > 0, all nodes are conceptually shifted by so many
    // characters from the start of the file.
    let start = node.getStart() - this.offset;
    if (start < 0) {
      // Special case: the source file conceptually spans all of the file, including any added
      // prefix added that causes offset to be set.
      if (node.kind !== ts.SyntaxKind.SourceFile) {
        // Nodes within [0, offset] of the new file (start < 0) is the additional prefix that has no
        // corresponding nodes in the original source, so return undefined.
        return undefined;
      }
      start = 0;
    }
    const end = node.getEnd() - this.offset;
    const key = this.nodeCacheKey(node.kind, start, end);
    return this.originalNodeByGeneratedRange.get(key);
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
