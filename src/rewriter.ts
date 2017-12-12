/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isClosureFileoverviewComment} from './fileoverview_comment_transformer';
import {NOOP_SOURCE_MAPPER, SourceMapper, SourcePosition} from './source_map_utils';
import * as ts from './typescript';

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

  constructor(public file: ts.SourceFile, private sourceMapper: SourceMapper = NOOP_SOURCE_MAPPER) {
  }

  getOutput(prefix?: string): {output: string, diagnostics: ts.Diagnostic[]} {
    if (this.indent !== 0) {
      throw new Error('visit() failed to track nesting');
    }
    let out = this.output.join('');
    if (prefix) {
      // Insert prefix after any leading @fileoverview comments, so they still come first in the
      // file. This must not use file.getStart() (comment position in the input file), but rahter
      // check comments in the new output, as those (in particular for comments) are unrelated.
      let insertionIdx = 0;
      for (const cr of ts.getLeadingCommentRanges(out, 0) || []) {
        if (isClosureFileoverviewComment(out.substring(cr.pos, cr.end))) {
          insertionIdx = cr.end;
          // Include space (in particular line breaks) after a @fileoverview comment; without the
          // space seperating it, TypeScript might elide the emit.
          while (insertionIdx < out.length && out[insertionIdx].match(/\s/)) insertionIdx++;
        }
      }
      out = out.substring(0, insertionIdx) + prefix + out.substring(insertionIdx);
      this.sourceMapper.shiftByOffset(prefix.length);
    }
    return {
      output: out,
      diagnostics: this.diagnostics,
    };
  }

  /**
   * visit traverses a Node, recursively writing all nodes not handled by this.maybeProcess.
   */
  visit(node: ts.Node) {
    // this.logWithIndent('node: ' + ts.SyntaxKind[node.kind]);
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

  /**
   * Writes all leading trivia (whitespace or comments) on node, or all trivia up to the given
   * position. Also marks those trivia as "already emitted" by shifting the skipCommentsUpTo marker.
   */
  writeLeadingTrivia(node: ts.Node, upTo = 0) {
    const upToOffset = upTo || node.getStart();
    this.writeRange(node, node.getFullStart(), upTo || node.getStart());
    this.skipCommentsUpToOffset = upToOffset;
  }

  addSourceMapping(node: ts.Node) {
    this.writeRange(node, node.getEnd(), node.getEnd());
  }

  /**
   * Start a source mapping for the given node. This allows adding source mappings for statements
   * that are not yet finished, and whose total length is unknown. Does not add recursive mappings
   * for child nodes.
   * @return a handler to finish the mapping.
   */
  startSourceMapping(node: ts.Node) {
    const startPos = this.position.position;
    return () => {
      this.sourceMapper.addMappingForRange(node, startPos, this.position.position);
    };
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
    // Add a source mapping. writeRange(from, to) always corresponds to
    // original source code, so add a mapping at the current location that
    // points back to the location at `from`. The additional code generated
    // by tsickle will then be considered part of the last mapped code
    // section preceding it. That's arguably incorrect (e.g. for the fake
    // methods defining properties), but is good enough for stack traces.
    const pos = this.file.getLineAndCharacterOfPosition(from);
    this.sourceMapper.addMapping(
        node, {line: pos.line, column: pos.character, position: from}, this.position, to - from);
    // getSourceFile().getText() is wrong here because it has the text of
    // the SourceFile node of the AST, which doesn't contain the comments
    // preceding that node.  Semantically these ranges are just offsets
    // into the original source file text, so slice from that.
    const text = this.file.text.slice(from, to);
    if (text) {
      this.emit(text);
    }
  }

  emit(str: string) {
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
      file: node.getSourceFile(),
      start: node.getStart(),
      length: node.getEnd() - node.getStart(),
      messageText,
      category: ts.DiagnosticCategory.Error,
      code: 0,
    });
  }
}

/** Returns the string contents of a ts.Identifier. */
export function getIdentifierText(identifier: ts.Identifier): string {
  // NOTE: the 'text' property on an Identifier may be escaped if it starts
  // with '__', so just use getText().
  return identifier.getText();
}

/** Returns a dot-joined qualified name (foo.bar.Baz). */
export function getEntityNameText(name: ts.EntityName): string {
  if (ts.isIdentifier(name)) {
    return getIdentifierText(name);
  }
  return getEntityNameText(name.left) + '.' + getIdentifierText(name.right);
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
