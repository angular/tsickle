/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {NOOP_SOURCE_MAPPER, SourceMapper, SourcePosition} from './source_map_utils';

/**
 * A Rewriter manages iterating through a ts.SourceFile, copying input
 * to output while letting the subclass potentially alter some nodes
 * along the way by implementing maybeProcess().
 */
export abstract class Rewriter {
  private output: string[] = [];
  /** Errors found while examining the code. */
  protected diagnostics: ts.Diagnostic[] = [];
  /** Current position in the output. */
  private position: SourcePosition = {line: 0, column: 0, position: 0};
  /**
   * The current level of recursion through TypeScript Nodes.  Used in formatting internal debug
   * print statements.
   */
  private indent = 0;
  /**
   * Skip emitting any code before the given offset. E.g. used to avoid emitting @fileoverview
   * comments twice.
   */
  private skipCommentsUpToOffset = -1;

  /**
   * Stack of the nodes we've visited.  Protected so that extenders who perform
   * logic outside the visit()/maybeProcess() pattern can keep track of which node
   * they're processing.
   */
  protected nodeStack: ts.Node[];

  constructor(public file: ts.SourceFile, private sourceMapper: SourceMapper = NOOP_SOURCE_MAPPER) {
    this.nodeStack = [file];
  }

  getOutput(): {output: string, diagnostics: ts.Diagnostic[]} {
    if (this.indent !== 0) {
      throw new Error('visit() failed to track nesting');
    }
    return {
      output: this.output.join(''),
      diagnostics: this.diagnostics,
    };
  }

  /**
   * visit traverses a Node, recursively writing all nodes not handled by this.maybeProcess.
   */
  visit(node: ts.Node) {
    // this.logWithIndent('node: ' + ts.SyntaxKind[node.kind]);
    this.nodeStack.push(node);
    this.indent++;
    try {
      if (!this.maybeProcess(node)) {
        this.writeNode(node);
      }
    } catch (e) {
      if (!e.message) e.message = 'Unhandled error in tsickle';
      e.message += `\n at ${ts.SyntaxKind[node.kind]} in ${this.file.fileName}:`;
      const {line, character} = this.file.getLineAndCharacterOfPosition(node.getStart());
      e.message += `${line + 1}:${character + 1}`;
      throw e;
    }
    this.indent--;
    this.nodeStack.pop();
  }

  /**
   * maybeProcess lets subclasses optionally processes a node.
   *
   * @return True if the node has been handled and doesn't need to be traversed;
   *    false to have the node written and its children recursively visited.
   */
  protected maybeProcess(node: ts.Node): boolean {
    return false;
  }

  /** writeNode writes a ts.Node, calling this.visit() on its children. */
  writeNode(node: ts.Node, skipComments = false, newLineIfCommentsStripped = true) {
    let pos = node.getFullStart();
    if (skipComments) {
      // To skip comments, we skip all whitespace/comments preceding
      // the node.  But if there was anything skipped we should emit
      // a newline in its place so that the node remains separated
      // from the previous node.  TODO: don't skip anything here if
      // there wasn't any comment.
      if (newLineIfCommentsStripped && node.getFullStart() < node.getStart()) {
        this.emit('\n');
      }
      pos = node.getStart();
    }
    this.writeNodeFrom(node, pos);
  }

  writeNodeFrom(node: ts.Node, pos: number, end = node.getEnd()) {
    if (end <= this.skipCommentsUpToOffset) {
      return;
    }
    const oldSkipCommentsUpToOffset = this.skipCommentsUpToOffset;
    this.skipCommentsUpToOffset = Math.max(this.skipCommentsUpToOffset, pos);
    ts.forEachChild(node, child => {
      this.writeRange(node, pos, child.getFullStart());
      this.visit(child);
      pos = child.getEnd();
    });
    this.writeRange(node, pos, end);
    this.skipCommentsUpToOffset = oldSkipCommentsUpToOffset;
  }

  writeLeadingTrivia(node: ts.Node) {
    this.writeRange(node, node.getFullStart(), node.getStart());
  }

  addSourceMapping(node: ts.Node) {
    this.writeRange(node, node.getEnd(), node.getEnd());
  }

  /**
   * Write a span of the input file as expressed by absolute offsets.
   * These offsets are found in attributes like node.getFullStart() and
   * node.getEnd().
   */
  writeRange(node: ts.Node, from: number, to: number) {
    const fullStart = node.getFullStart();
    const textStart = node.getStart();
    if (from >= fullStart && from < textStart) {
      from = Math.max(from, this.skipCommentsUpToOffset);
    }
    // getSourceFile().getText() is wrong here because it has the text of
    // the SourceFile node of the AST, which doesn't contain the comments
    // preceding that node.  Semantically these ranges are just offsets
    // into the original source file text, so slice from that.
    const text = this.file.text.slice(from, to);
    const pos = this.file.getLineAndCharacterOfPosition(from);
    // Source maps are line based, so if str has leading whitespace, particularly
    // newlines, we want to map to the start of/line of the actual text
    const originalSourcePosition = this.findOffsetOfFirstNonWhitespaceCharacter(
        text, {line: pos.line, column: pos.character, position: from});
    this.emit(text, node, originalSourcePosition);
  }

  /**
   * @param str string to emit
   * @param node the node to source map str to
   * @param original the position in the source file to source map str to
   *
   * Every emit call results in a source mapping being made, if a node and
   * original SourcePosition aren't supplied, str is source mapped to the
   * beginning of the current node.
   */
  emit(str: string): void;
  emit(str: string, node: ts.Node, original: SourcePosition): void;
  emit(str: string, node?: ts.Node, original?: SourcePosition): void {
    if (!node || !original) {
      // Only the transformer source mapper uses the node, and providing
      // a source mapping for every emit messes up the transformer
      // code path, so unless we're emitting copied text from a node, don't
      // set it
      original = this.sourcePositionOfNodeStart(this.getCurrentNode());
    }
    // Source maps are line based, so if str has leading whitespace, particularly
    // newlines, we want to map to the start of/line of the actual text
    const generated = this.findOffsetOfFirstNonWhitespaceCharacter(str, this.position);
    this.sourceMapper.addMapping(
        node, original, generated,
        str.length - this.findOffsetOfFirstNonWhitespaceCharacter(str).position);
    this.output.push(str);
    for (const c of str) {
      this.position.column++;
      if (c === '\n') {
        this.position.line++;
        this.position.column = 0;
      }
    }
    this.position.position += str.length;
  }

  sourcePositionOfNodeStart(node: ts.Node): SourcePosition {
    const nodeStart = node.getStart();
    const pos = this.file.getLineAndCharacterOfPosition(node.getStart());
    return this.findOffsetOfFirstNonWhitespaceCharacter(
        node.getText(), {line: pos.line, column: pos.character, position: nodeStart});
  }

  /**
   * If you pass a pos, it returns a Source Position offset from that pos.
   *  Otherwise, it just returns the absolute offsets
   */
  findOffsetOfFirstNonWhitespaceCharacter(str: string, pos = {line: 0, column: 0, position: 0}):
      SourcePosition {
    let {line, column, position} = pos;
    for (const c of str) {
      if (c === '\n') {
        line++;
        column = 0;
        position++;
      } else if (/\s/.test(c)) {
        column++;
        position++;
      } else {
        return {line, column, position};
      }
    }
    return {line, column, position};
  }


  /** Removes comment metacharacters from a string, to make it safe to embed in a comment. */
  escapeForComment(str: string): string {
    return str.replace(/\/\*/g, '__').replace(/\*\//g, '__');
  }

  /* tslint:disable: no-unused-variable */
  logWithIndent(message: string) {
    /* tslint:enable: no-unused-variable */
    const prefix = new Array(this.indent + 1).join('| ');
    console.log(prefix + message);
  }

  /**
   * Produces a compiler error that references the Node's kind.  This is useful for the "else"
   * branch of code that is attempting to handle all possible input Node types, to ensure all cases
   * covered.
   */
  errorUnimplementedKind(node: ts.Node, where: string) {
    this.error(node, `${ts.SyntaxKind[node.kind]} not implemented in ${where}`);
  }

  error(node: ts.Node, messageText: string) {
    this.diagnostics.push({
      file: this.file,
      start: node.getStart(),
      length: node.getEnd() - node.getStart(),
      messageText,
      category: ts.DiagnosticCategory.Error,
      code: 0,
    });
  }

  getCurrentNode() {
    return this.nodeStack[this.nodeStack.length - 1];
  }
}

/** Returns the string contents of a ts.Identifier. */
export function getIdentifierText(identifier: ts.Identifier): string {
  // NOTE: the 'text' property on an Identifier may be escaped if it starts
  // with '__', so just use getText().
  return identifier.getText();
}

/**
 * Converts an escaped TypeScript name into the original source name.
 * Prefer getIdentifierText() instead if possible.
 */
export function unescapeName(name: string): string {
  // See the private function unescapeIdentifier in TypeScript's utilities.ts.
  if (name.match(/^___/)) return name.substr(1);
  return name;
}
