/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import * as jsdoc from './jsdoc';
import * as path from './path';
import {createNotEmittedStatement, reportDiagnostic, synthesizeCommentRanges, updateSourceFileNode} from './transformer_util';

/**
 * A set of JSDoc tags that mark a comment as a fileoverview comment. These are
 * recognized by other pieces of infrastructure (Closure Compiler, module
 * system, ...).
 */
const FILEOVERVIEW_COMMENT_MARKERS: ReadonlySet<string> =
    new Set(['fileoverview', 'externs', 'modName', 'mods', 'pintomodule']);

/**
 * Given a parsed \@fileoverview comment, ensures it has all the attributes we
 * need. This function can be called to modify an existing comment or to make a
 * new one.
 *
 * @param source Original TS source file. Its path is added in \@fileoverview.
 * @param tags Comment as parsed list of tags; modified in-place.
 */
function augmentFileoverviewComments(
    options: ts.CompilerOptions, source: ts.SourceFile, tags: jsdoc.Tag[],
    generateExtraSuppressions: boolean) {
  // Ensure we start with a @fileoverview.
  let fileOverview = tags.find(t => t.tagName === 'fileoverview');
  if (!fileOverview) {
    fileOverview = {tagName: 'fileoverview', text: 'added by tsickle'};
    tags.splice(0, 0, fileOverview);
  }
  if (options.rootDir != null) {
    const GENERATED_FROM_COMMENT_TEXT = `\n${
        jsdoc.createGeneratedFromComment(
            path.relative(options.rootDir, source.fileName))}`;

    fileOverview.text = fileOverview.text ?
        fileOverview.text + GENERATED_FROM_COMMENT_TEXT :
        GENERATED_FROM_COMMENT_TEXT;
  }

  if (generateExtraSuppressions) {
    const suppressions = [
    // Ensure our suppressions are included in the @suppress tag:
    // * Suppress checkTypes.  We believe the code has already been type-checked
    // by TypeScript, and we cannot model all the TypeScript type decisions in
    // Closure syntax.
      'checkTypes',
    // * Suppress extraRequire.  We remove extra requires at the TypeScript
    // level, so any require that gets to the JS level is a load-bearing
    // require.
      'extraRequire',
    // * Types references are propagated between files even when they are not
    // directly imported. While these are violations of the "missing require"
    // rules they are believed to be safe.
      'missingRequire',
    // * Suppress uselessCode.  We emit an "if (false)" around type
    // declarations, which is flagged as unused code unless we suppress it.
      'uselessCode',
    // * Suppress some checks for user errors that TS already checks.
      'missingReturn',
      'unusedPrivateMembers',
    // * Suppress checking for @override, because TS doesn't model it.
      'missingOverride',
    // * Suppress const JSCompiler errors in TS file.
    // a) TypeScript already checks for "const" and
    // b) there are various JSCompiler false positives
      'const',
    ];

    const suppressTags = suppressions.map(
        s => ({tagName: 'suppress', text: 'added by tsickle', type: s}));

    // Special case the @license tag because all text following this tag is
    // treated by the compiler as part of the license, so we need to place the
    // new @suppress tags before @license.
    const licenseTagIndex = tags.findIndex(t => t.tagName === 'license');
    if (licenseTagIndex !== -1) {
      tags.splice(licenseTagIndex, 0, ...suppressTags);
    } else {
      tags.push(...suppressTags);
    }
  }
}

/**
 * A transformer that ensures the emitted JS file has an \@fileoverview comment
 * that contains an
 * \@suppress {checkTypes} annotation by either adding or updating an existing
 * comment.
 */
export function transformFileoverviewCommentFactory(
    options: ts.CompilerOptions, diagnostics: ts.Diagnostic[],
    generateExtraSuppressions: boolean) {
  return (): (sourceFile: ts.SourceFile) => ts.SourceFile => {
    function checkNoFileoverviewComments(
        context: ts.Node, comments: jsdoc.SynthesizedCommentWithOriginal[],
        message: string) {
      for (const comment of comments) {
        const parse = jsdoc.parse(comment);
        if (parse !== null &&
            parse.tags.some(t => FILEOVERVIEW_COMMENT_MARKERS.has(t.tagName))) {
          // Report a warning; this should not break compilation in third party
          // code.
          reportDiagnostic(
              diagnostics, context, message, comment.originalRange,
              ts.DiagnosticCategory.Warning);
        }
      }
    }

    return (sourceFile: ts.SourceFile) => {
      // TypeScript supports including some other file formats in compilation
      // (JS, JSON). Avoid adding comments to those.
      if (!sourceFile.fileName.match(/\.tsx?$/)) {
        return sourceFile;
      }

      const text = sourceFile.getFullText();

      let fileComments: ts.SynthesizedComment[] = [];
      const firstStatement =
          sourceFile.statements.length && sourceFile.statements[0] || null;

      const originalComments = ts.getLeadingCommentRanges(text, 0) || [];
      if (!firstStatement) {
        // In an empty source file, all comments are file-level comments.
        fileComments = synthesizeCommentRanges(sourceFile, originalComments);
      } else {
        // Search for the last comment split from the file with a \n\n. All
        // comments before that are considered fileoverview comments, all
        // comments after that belong to the next statement(s). If none found,
        // comments remains empty, and the code below will insert a new
        // fileoverview comment.
        for (let i = originalComments.length - 1; i >= 0; i--) {
          const end = originalComments[i].end;
          if (!text.substring(end).startsWith('\n\n') &&
              !text.substring(end).startsWith('\r\n\r\n')) {
            continue;
          }
          // This comment is separated from the source file with a double break,
          // marking it (and any preceding comments) as a file-level comment.
          // Split them off and attach them onto a NotEmittedStatement, so that
          // they do not get lost later on.
          const synthesizedComments =
              jsdoc.synthesizeLeadingComments(firstStatement);
          const notEmitted = ts.factory.createNotEmittedStatement(sourceFile);
          // Modify the comments on the firstStatement in place by removing the
          // file-level comments.
          fileComments = synthesizedComments.splice(0, i + 1);
          // Move the fileComments onto notEmitted.
          ts.setSyntheticLeadingComments(notEmitted, fileComments);
          sourceFile =
              updateSourceFileNode(sourceFile, ts.factory.createNodeArray([
                notEmitted, firstStatement, ...sourceFile.statements.slice(1)
              ]));
          break;
        }


        // Now walk every top level statement and escape/drop any @fileoverview
        // comments found. Closure ignores all @fileoverview comments but the
        // last, so tsickle must make sure not to emit duplicated ones.
        for (let i = 0; i < sourceFile.statements.length; i++) {
          const stmt = sourceFile.statements[i];
          // Accept the NotEmittedStatement inserted above.
          if (i === 0 && stmt.kind === ts.SyntaxKind.NotEmittedStatement) {
            continue;
          }
          const comments = jsdoc.synthesizeLeadingComments(stmt);
          checkNoFileoverviewComments(
              stmt, comments,
              `file comments must be at the top of the file, ` +
                  `separated from the file body by an empty line.`);
        }
      }

      // Closure Compiler considers the *last* comment with @fileoverview (or
      // #externs or
      // @nocompile) that has not been attached to some other tree node to be
      // the file overview comment, and only applies @suppress tags from it.
      // Google-internal tooling considers *any* comment
      // mentioning @fileoverview.
      let fileoverviewIdx = -1;
      let tags: jsdoc.Tag[] = [];
      for (let i = fileComments.length - 1; i >= 0; i--) {
        const parse = jsdoc.parseContents(fileComments[i].text);
        if (parse !== null &&
            parse.tags.some(t => FILEOVERVIEW_COMMENT_MARKERS.has(t.tagName))) {
          fileoverviewIdx = i;
          tags = parse.tags;
          break;
        }
      }

      if (fileoverviewIdx !== -1) {
        checkNoFileoverviewComments(
            firstStatement || sourceFile,
            fileComments.slice(0, fileoverviewIdx),
            `duplicate file level comment`);
      }

      augmentFileoverviewComments(options, sourceFile, tags, generateExtraSuppressions);
      const commentText = jsdoc.toStringWithoutStartEnd(tags);

      if (fileoverviewIdx < 0) {
        // No existing comment to merge with, just emit a new one.
        return addNewFileoverviewComment(sourceFile, commentText);
      }

      fileComments[fileoverviewIdx].text = commentText;
      // sf does not need to be updated, synthesized comments are mutable.
      return sourceFile;
    };
  };
}

function addNewFileoverviewComment(
    sf: ts.SourceFile, commentText: string): ts.SourceFile {
  let syntheticFirstStatement = createNotEmittedStatement(sf);
  syntheticFirstStatement = ts.addSyntheticTrailingComment(
      syntheticFirstStatement, ts.SyntaxKind.MultiLineCommentTrivia,
      commentText, true);
  return updateSourceFileNode(
      sf,
      ts.factory.createNodeArray([syntheticFirstStatement, ...sf.statements]));
}
