/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import * as decorator from './decorator-annotator';
import * as es5processor from './es5processor';
import {ModulesManifest} from './modules_manifest';
import {SourceMapper, SourcePosition} from './source_map_utils';
import {isTypeNodeKind} from './ts_utils';
import * as tsickle from './tsickle';

export interface TransformerOptions extends es5processor.Options, tsickle.Options {
  /**
   * Whether to downlevel decorators
   */
  transformDecorators?: boolean;
  /**
   * Whether to convers types to closure
   */
  transformTypesToClosure?: boolean;
}

export interface TransformerHost extends es5processor.Host, tsickle.Host {
  /**
   * If true, tsickle and decorator downlevel processing will be skipped for
   * that file.
   */
  shouldSkipTsickleProcessing(fileName: string): boolean;
  /**
   * Tsickle treats warnings as errors, if true, ignore warnings.  This might be
   * useful for e.g. third party code.
   */
  shouldIgnoreWarningsForPath(filePath: string): boolean;
}

export interface EmitResult extends ts.EmitResult {
  // The manifest of JS modules output by the compiler.
  modulesManifest: ModulesManifest;
  /** externs.js files produced by tsickle, if any. */
  externs: {[fileName: string]: string};
}

export interface EmitTransformers {
  beforeTsickle?: Array<ts.TransformerFactory<ts.SourceFile>>;
  beforeTs?: Array<ts.TransformerFactory<ts.SourceFile>>;
  afterTs?: Array<ts.TransformerFactory<ts.SourceFile>>;
}

export function emitWithTsickle(
    program: ts.Program, host: TransformerHost, options: TransformerOptions,
    tsHost: ts.CompilerHost, tsOptions: ts.CompilerOptions, targetSourceFile?: ts.SourceFile,
    writeFile?: ts.WriteFileCallback, cancellationToken?: ts.CancellationToken,
    emitOnlyDtsFiles?: boolean, customTransformers?: EmitTransformers): EmitResult {
  let tsickleDiagnostics: ts.Diagnostic[] = [];
  const typeChecker = createOriginalNodeTypeChecker(program.getTypeChecker());
  const beforeTsTransformers: Array<ts.TransformerFactory<ts.SourceFile>> = [];
  if (options.transformTypesToClosure) {
    // Note: tsickle.annotate can also lower decorators in the same run.
    beforeTsTransformers.push(createTransformer(host, (sourceFile, sourceMapper) => {
      const tisckleOptions: tsickle.Options = {...options, filterTypesForExport: true};
      const {output, diagnostics} = tsickle.annotate(
          typeChecker, sourceFile, host, tisckleOptions, tsHost, tsOptions, sourceMapper);
      tsickleDiagnostics.push(...diagnostics);
      return output;
    }));
  } else if (options.transformDecorators) {
    beforeTsTransformers.push(createTransformer(host, (sourceFile, sourceMapper) => {
      const {output, diagnostics} =
          decorator.convertDecorators(typeChecker, sourceFile, sourceMapper);
      tsickleDiagnostics.push(...diagnostics);
      return output;
    }));
  }
  // // For debugging: transformer that just emits the same text.
  // beforeTsTransformers.push(createTransformer(host, typeChecker, (sourceFile, sourceMapper) => {
  //   sourceMapper.addMapping(sourceFile, {position: 0, line: 0, column: 0}, {position: 0, line: 0,
  //   column: 0}, sourceFile.text.length); return sourceFile.text;
  // }));
  const afterTsTransformers: Array<ts.TransformerFactory<ts.SourceFile>> = [];
  if (customTransformers) {
    if (customTransformers.beforeTsickle) {
      beforeTsTransformers.unshift(...customTransformers.beforeTsickle);
    }

    if (customTransformers.beforeTs) {
      beforeTsTransformers.push(...customTransformers.beforeTs);
    }
    if (customTransformers.afterTs) {
      afterTsTransformers.push(...customTransformers.afterTs);
    }
  }
  let writeFileImpl = writeFile;
  const modulesManifest = new ModulesManifest();
  if (options.googmodule) {
    writeFileImpl =
        (fileName: string, content: string, writeByteOrderMark: boolean,
         onError?: (message: string) => void, sourceFiles?: ts.SourceFile[]) => {
          if (!tsickle.isDtsFileName(fileName) && !fileName.endsWith('.map')) {
            content = es5processor.convertCommonJsToGoogModule(
                host, options, modulesManifest, fileName, content);
          }
          if (writeFile) {
            writeFile(fileName, content, writeByteOrderMark, onError, sourceFiles);
          } else {
            tsHost.writeFile(fileName, content, writeByteOrderMark, onError, sourceFiles);
          }
        };
  }

  const {diagnostics: tsDiagnostics, emitSkipped, emittedFiles} = program.emit(
      targetSourceFile, writeFileImpl, cancellationToken, emitOnlyDtsFiles,
      {before: beforeTsTransformers, after: afterTsTransformers});

  const externs: {[fileName: string]: string} = {};
  // Note: we also need to collect externs on .d.ts files,
  // so we can't do this in the ts transformer pipeline.
  (targetSourceFile ? [targetSourceFile] : program.getSourceFiles()).forEach(sf => {
    if (host.shouldSkipTsickleProcessing(sf.fileName)) {
      return;
    }
    const {output, diagnostics} = tsickle.writeExterns(typeChecker, sf, host, options);
    if (output) {
      externs[sf.fileName] = output;
    }
    if (diagnostics) {
      tsickleDiagnostics.push(...diagnostics);
    }
  });
  // All diagnostics (including warnings) are treated as errors.
  // If we've decided to ignore them, just discard them.
  // Warnings include stuff like "don't use @type in your jsdoc"; tsickle
  // warns and then fixes up the code to be Closure-compatible anyway.
  tsickleDiagnostics = tsickleDiagnostics.filter(
      d => d.category === ts.DiagnosticCategory.Error ||
          !host.shouldIgnoreWarningsForPath(d.file.fileName));

  return {
    modulesManifest,
    emitSkipped,
    emittedFiles,
    diagnostics: [...tsDiagnostics, ...tsickleDiagnostics],
    externs
  };
}

function createTransformer(
    host: TransformerHost,
    operator: (sourceFile: ts.SourceFile, sourceMapper: SourceMapper) =>
        string): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => (sourceFile: ts.SourceFile): ts.SourceFile => {
    if (host.shouldSkipTsickleProcessing(sourceFile.fileName)) {
      return sourceFile;
    }
    const originalNodeByGeneratedRange = new Map<string, ts.Node>();

    const addFullNodeRange = (node: ts.Node, genStartPos: number) => {
      originalNodeByGeneratedRange.set(
          nodeCacheKey(node.kind, genStartPos, genStartPos + (node.getEnd() - node.getStart())),
          node);
      node.forEachChild(
          child => addFullNodeRange(child, genStartPos + (child.getStart() - node.getStart())));
    };

    const genStartPositions = new Map<ts.Node, number>();
    const sourceMapper = {
      addMapping: (
          originalNode: ts.Node, original: SourcePosition, generated: SourcePosition,
          length: number) => {
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
          genStartPositions.set(originalNode, genStartPos);
        }
        if (originalStartPos + length === originalNode.getEnd()) {
          originalNodeByGeneratedRange.set(
              nodeCacheKey(
                  originalNode.kind, genStartPositions.get(originalNode)!, genStartPos + length),
              originalNode);
        }
        originalNode.forEachChild((child) => {
          if (child.getStart() >= originalStartPos && child.getEnd() <= originalStartPos + length) {
            addFullNodeRange(child, genStartPos + (child.getStart() - originalStartPos));
          }
        });
      }
    };

    const newFile = ts.createSourceFile(
        sourceFile.fileName, operator(sourceFile, sourceMapper), ts.ScriptTarget.Latest, true);
    const commentSynthesizer = new CommentSynthesizer(newFile);
    let synthStmts =
        commentSynthesizer.synthesizeDetachedLeadingComments(newFile, newFile.statements);
    synthStmts = ts.setTextRange(
        ts.createNodeArray(
            ([] as ts.Statement[])
                .concat(
                    ...synthStmts.map(
                        stmt => convertToSyntheticNode(
                            context, stmt, sourceFile, newFile, originalNodeByGeneratedRange,
                            commentSynthesizer)) as ts.Statement[])),
        synthStmts);
    synthStmts = commentSynthesizer.synthesizeDetachedTrailingComments(newFile, synthStmts);
    ts.setTextRange(synthStmts, {pos: -1, end: -1});

    // Note: Need to clone the original file (and not use `ts.updateSourceFileNode`)
    // as otherwise TS fails when resolving types for decorators.
    const transformedFile = getMutableClone(sourceFile);
    transformedFile.statements = synthStmts;
    // Need to set parents as some of TypeScript's emit logic relies on it (e.g. emitting
    // decorators)
    synthStmts.forEach(stmt => setParentsForSyntheticNodes(stmt, transformedFile));
    return transformedFile;
  };
}

function createNotEmittedStatement(sourceFile: ts.SourceFile) {
  const stmt = ts.createNotEmittedStatement(sourceFile);
  ts.setOriginalNode(stmt, undefined);
  ts.setTextRange(stmt, {pos: 0, end: 0});
  return stmt;
}

function getMutableClone<T extends ts.Node>(node: T): T {
  const clone = ts.getMutableClone(node);
  clone.flags &= ~ts.NodeFlags.Synthesized;
  return clone;
}

class CommentSynthesizer {
  private lastCommentEnd = 0;
  constructor(private sourceFile: ts.SourceFile) {}

  synthesizeLeadingComments(node: ts.Node): ts.Node {
    if (node.kind === ts.SyntaxKind.Block) {
      const block = node as ts.Block;
      const newStmts = this.synthesizeDetachedLeadingComments(block, block.statements);
      if (block.statements !== newStmts) {
        return ts.updateBlock(block, newStmts);
      }
    }

    const parent = node.parent;
    const adjustedNodeFullStart = Math.max(this.lastCommentEnd, node.getFullStart());
    const sharesStartWithParent = parent && parent.getFullStart() === adjustedNodeFullStart;
    if (sharesStartWithParent) {
      return node;
    }
    const trivia = this.sourceFile.text.substring(adjustedNodeFullStart, node.getStart());
    const leadingComments = ts.getLeadingCommentRanges(trivia, 0);
    if (leadingComments && leadingComments.length) {
      ts.setSyntheticLeadingComments(node, convertCommentRanges(leadingComments, trivia));
      this.lastCommentEnd = node.getStart();
    }
    return node;
  }

  synthesizeTrailingComments(node: ts.Node) {
    if (node.kind === ts.SyntaxKind.Block) {
      const block = node as ts.Block;
      const newStmts = this.synthesizeDetachedTrailingComments(block, block.statements);
      if (block.statements !== newStmts) {
        return ts.updateBlock(block, newStmts);
      }
    }

    const parent = node.parent;
    const sharesEndWithParent = parent && parent.getEnd() === node.getEnd();
    if (sharesEndWithParent) {
      return node;
    }
    const trailingComments = ts.getTrailingCommentRanges(this.sourceFile.text, node.getEnd());
    if (trailingComments && trailingComments.length) {
      ts.setSyntheticTrailingComments(
          node, convertCommentRanges(trailingComments, this.sourceFile.text));
      this.lastCommentEnd = trailingComments[trailingComments.length - 1].end;
    }
    return node;
  }

  synthesizeDetachedLeadingComments(node: ts.Node, statements: ts.NodeArray<ts.Statement>):
      ts.NodeArray<ts.Statement> {
    if (!statements.length) {
      return statements;
    }
    const trivia = this.sourceFile.text.substring(node.getFullStart(), node.getStart());
    const detachedComments = this.getDetachedStartingComments(node.getFullStart(), trivia);
    if (!detachedComments.length) {
      return statements;
    }
    const lastComment = detachedComments[detachedComments.length - 1];
    this.lastCommentEnd = lastComment.end;
    const commentStmt = createNotEmittedStatement(this.sourceFile);
    ts.setEmitFlags(commentStmt, ts.EmitFlags.CustomPrologue);
    ts.setSyntheticTrailingComments(commentStmt, convertCommentRanges(detachedComments, trivia));
    return ts.setTextRange(ts.createNodeArray([commentStmt, ...statements]), statements);
  }

  synthesizeDetachedTrailingComments(node: ts.Node, statements: ts.NodeArray<ts.Statement>):
      ts.NodeArray<ts.Statement> {
    const trailingTrivia = this.sourceFile.text.substring(statements.end, node.end);
    const detachedComments = ts.getLeadingCommentRanges(trailingTrivia, 0);
    if (!detachedComments || !detachedComments.length) {
      return statements;
    }
    const lastComment = detachedComments[detachedComments.length - 1];
    this.lastCommentEnd = lastComment.end;
    const commentStmt = createNotEmittedStatement(this.sourceFile);
    ts.setEmitFlags(commentStmt, ts.EmitFlags.CustomPrologue);
    ts.setSyntheticLeadingComments(
        commentStmt, convertCommentRanges(detachedComments, trailingTrivia));
    return ts.setTextRange(ts.createNodeArray([...statements, commentStmt]), statements);
  }

  // Adapted from compiler/comments.ts in TypeScript
  private getDetachedStartingComments(fullStart: number, trivia: string): ts.CommentRange[] {
    const leadingComments = ts.getLeadingCommentRanges(trivia, 0);
    if (!leadingComments || !leadingComments.length) {
      return [];
    }
    const detachedComments: ts.CommentRange[] = [];
    let lastComment: ts.CommentRange|undefined = undefined;

    for (const comment of leadingComments) {
      if (lastComment) {
        const lastCommentLine = this.getLineOfPos(fullStart + lastComment.end);
        const commentLine = this.getLineOfPos(fullStart + comment.pos);

        if (commentLine >= lastCommentLine + 2) {
          // There was a blank line between the last comment and this comment.  This
          // comment is not part of the copyright comments.  Return what we have so
          // far.
          break;
        }
      }

      detachedComments.push(comment);
      lastComment = comment;
    }

    if (detachedComments.length) {
      // All comments look like they could have been part of the copyright header.  Make
      // sure there is at least one blank line between it and the node.  If not, it's not
      // a copyright header.
      const lastCommentLine =
          this.getLineOfPos(fullStart + detachedComments[detachedComments.length - 1].end);
      const nodeLine = this.getLineOfPos(fullStart + trivia.length);
      if (nodeLine >= lastCommentLine + 2) {
        // Valid detachedComments
        return detachedComments;
      }
    }
    return [];
  }

  getLineOfPos(pos: number): number {
    return ts.getLineAndCharacterOfPosition(this.sourceFile, pos).line;
  }
}

function convertCommentRanges(parsedComments: ts.CommentRange[], text: string) {
  return parsedComments.map(({kind, pos, end, hasTrailingNewLine}, commentIdx) => {
    let commentText = text.substring(pos, end).trim();
    if (kind === ts.SyntaxKind.MultiLineCommentTrivia) {
      commentText = commentText.replace(/(^\/\*)|(\*\/$)/g, '');
    } else if (kind === ts.SyntaxKind.SingleLineCommentTrivia) {
      commentText = commentText.replace(/(^\/\/)/g, '');
    }
    const comment:
        ts.SynthesizedComment = {kind, text: commentText, hasTrailingNewLine, pos: -1, end: -1};
    return comment;
  });
}

function convertToSyntheticNode(
    context: ts.TransformationContext, node: ts.Node, originalSourceFile: ts.SourceFile,
    sourceFile: ts.SourceFile, originalNodeByGeneratedRange: Map<string, ts.Node>,
    commentSynthesizer: CommentSynthesizer, mayUseOriginalNodes = true): ts.Node|ts.Node[] {
  if (node.flags & ts.NodeFlags.Synthesized) {
    return node;
  }
  const fullStart = node.getFullStart();
  const start = fullStart === -1 ? -1 : node.getStart();
  const end = node.getEnd();
  const originalNode = originalNodeByGeneratedRange.get(nodeCacheKey(node.kind, start, end));
  // Ignore types as they are not printed anyways,
  // and they lead to problems with suspended lexical environments.
  if (isTypeNodeKind(node.kind)) {
    return originalNode || node;
  }

  // For nodes that were fully mapped, use the original node instead.
  if (mayUseOriginalNodes && originalNode &&
      sourceFile.text.substring(fullStart, end) ===
          originalSourceFile.text.substring(originalNode.getFullStart(), originalNode.getEnd())) {
    return originalNode;
  }

  // Never use original nodes for parts of a modified ExportDeclaration,
  // as otherwise we get an error when TS tries to analyze it...
  mayUseOriginalNodes = mayUseOriginalNodes && node.kind !== ts.SyntaxKind.ExportDeclaration;
  node = commentSynthesizer.synthesizeLeadingComments(node);
  node = ts.visitEachChild(
      node,
      child => convertToSyntheticNode(
          context, child, originalSourceFile, sourceFile, originalNodeByGeneratedRange,
          commentSynthesizer, mayUseOriginalNodes),
      context);
  node = commentSynthesizer.synthesizeTrailingComments(node);
  node.flags |= ts.NodeFlags.Synthesized;
  node.parent = undefined;
  ts.setTextRange(node, {pos: -1, end: -1});
  // reset the pos/end of all NodeArrays
  // tslint:disable-next-line:no-any
  const nodeAny = node as {[prop: string]: any};
  for (const prop in nodeAny) {
    if (!nodeAny.hasOwnProperty(prop)) {
      continue;
    }
    const value = nodeAny[prop];
    if (isNodeArray(value)) {
      ts.setTextRange(value, {pos: -1, end: -1});
    }
  }
  if (originalNode) {
    ts.setOriginalNode(node, originalNode);
    ts.setSourceMapRange(node, originalNode);
    // Needed so that e.g. `module { ... }` prints the variable statement
    // before the closure.
    // tslint:disable-next-line:no-any
    (node as any).symbol = (originalNode as any).symbol;
  }
  if (node.kind === ts.SyntaxKind.VariableStatement) {
    if (node.modifiers && node.modifiers.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
      // Note: TypeScript does not emit synthetic comments on exported variable statements,
      // so we have to create a fake statement to hold the comments.
      // Note: We cannot use the trick via `ts.setTextRange` that we use for export / import
      // declarations, as somehow TypeScript would still skip some comments.
      const synthComments = ts.getSyntheticLeadingComments(node);
      if (synthComments && synthComments.length) {
        ts.setSyntheticLeadingComments(node, []);
        const commentStmt = createNotEmittedStatement(originalSourceFile);
        ts.setSyntheticLeadingComments(commentStmt, synthComments);
        return [commentStmt, node];
      }
    }
  }

  if (node.kind === ts.SyntaxKind.ExportDeclaration ||
      node.kind === ts.SyntaxKind.ImportDeclaration) {
    if (originalNode) {
      // Note: TypeScript does not emit synthetic comments on import / export declarations.
      // As tsickle never modifies comments of export / import declarations,
      // we can just set the original text range and let typescript reuse the original comments.
      // This is simpler than emitting a fake statement with the synthesized comments,
      // as in that case we would need to calculate whether the export / import statement
      // will be elided, which is far from trivial (especially for import statements).
      ts.setTextRange(node, {pos: originalNode.getFullStart(), end: originalNode.getEnd()});

      // Note: Somewhow, TypeScript does not write exports correctly if we
      // have an original node for an export declaration. So we reset it to undefined.
      // This still allows TypeScript to elided exports as it will actually check
      // the values in the exportClause instead.
      if (node.kind === ts.SyntaxKind.ExportDeclaration) {
        ts.setOriginalNode(node, undefined);
      }
    }
  }
  return node;
}

function setParentsForSyntheticNodes(node: ts.Node, parent: ts.Node|undefined) {
  if (!(node.flags & ts.NodeFlags.Synthesized)) {
    return;
  }
  node.parent = parent;
  node.forEachChild(child => {
    setParentsForSyntheticNodes(child, node);
  });
}

function createOriginalNodeTypeChecker(tc: ts.TypeChecker): ts.TypeChecker {
  const result = Object.create(tc);
  result.getTypeAtLocation = (node: ts.Node) => tc.getTypeAtLocation(ts.getOriginalNode(node));
  result.getSymbolAtLocation = (node: ts.Node) => tc.getSymbolAtLocation(ts.getOriginalNode(node));
  result.getSignatureFromDeclaration = (declaration: ts.SignatureDeclaration) =>
      tc.getSignatureFromDeclaration(ts.getOriginalNode(declaration) as ts.SignatureDeclaration);
  result.getSymbolsInScope = (location: ts.Node, meaning: ts.SymbolFlags) =>
      tc.getSymbolsInScope(ts.getOriginalNode(location), meaning);
  result.getConstantValue =
      (node: ts.EnumMember | ts.PropertyAccessExpression | ts.ElementAccessExpression) =>
          tc.getConstantValue(
              ts.getOriginalNode(node) as ts.EnumMember | ts.PropertyAccessExpression |
              ts.ElementAccessExpression);
  result.getTypeOfSymbolAtLocation = (symbol: ts.Symbol, node: ts.Node) =>
      tc.getTypeOfSymbolAtLocation(symbol, ts.getOriginalNode(node));
  return result;
}

function nodeCacheKey(kind: ts.SyntaxKind, start: number, end: number): string {
  return `${kind}#${start}#${end}`;
}

// tslint:disable-next-line:no-any
function isNodeArray(value: any): value is ts.NodeArray<any> {
  const anyValue = value;
  return Array.isArray(value) && anyValue.pos !== undefined && anyValue.end !== undefined;
}
