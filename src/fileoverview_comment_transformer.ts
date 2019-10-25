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
 * A set of JSDoc tags that mark a comment as a fileoverview comment. These are recognized by other
 * pieces of infrastructure (Closure Compiler, module system, ...).
 */
const FILEOVERVIEW_COMMENT_MARKERS: ReadonlySet<string> =
    new Set(['fileoverview', 'externs', 'modName', 'mods', 'pintomodule']);

/**
 * Given a parsed \@fileoverview comment, ensures it has all the attributes we need.
 * This function can be called to modify an existing comment or to make a new one.
 *
 * @param source Original TS source file. Its path is added in \@fileoverview.
 * @param tags Comment as parsed list of tags; modified in-place.
 */
function augmentFileoverviewComments(
    options: ts.CompilerOptions, source: ts.SourceFile, tags: jsdoc.Tag[]) {
  // Ensure we start with a @fileoverview.
  let fileOverview = tags.find(t => t.tagName === 'fileoverview');
  if (!fileOverview) {
    fileOverview = {tagName: 'fileoverview', text: 'added by tsickle'};
    tags.splice(0, 0, fileOverview);
  }
  if (options.rootDir != null) {
    // This comment is read by other tools so it's important that its format
    // doesn't change.
    fileOverview.text += `\nGenerated from: ${path.relative(options.rootDir, source.fileName)}`;
  }

  // Find or create a @suppress tag.
  // Closure compiler barfs if there's a duplicated @suppress tag in a file, so the tag must
  // only appear once and be merged.
  let suppressTag = tags.find(t => t.tagName === 'suppress');
  let suppressions: Set<string>;
  if (suppressTag) {
    suppressions = new Set((suppressTag.type || '').split(',').map(s => s.trim()));
  } else {
    suppressTag = {tagName: 'suppress', text: 'checked by tsc'};
    tags.push(suppressTag);
    suppressions = new Set();
  }

  // Ensure our suppressions are included in the @suppress tag:
  // 1) Suppress checkTypes.  We believe the code has already been type-checked by TypeScript,
  // and we cannot model all the TypeScript type decisions in Closure syntax.
  suppressions.add('checkTypes');
  // 2) Suppress extraRequire.  We remove extra requires at the TypeScript level, so any require
  // that gets to the JS level is a load-bearing require.
  suppressions.add('extraRequire');
  // 3) Suppress uselessCode.  We emit an "if (false)" around type declarations,
  // which is flagged as unused code unless we suppress it.
  suppressions.add('uselessCode');
  // 4) Suppress some checks for user errors that TS already checks.
  suppressions.add('missingReturn');
  suppressions.add('unusedPrivateMembers');
  // 5) Suppress checking for @override, because TS doesn't model it.
  suppressions.add('missingOverride');
  // 6) Suppress constantProperty checking, which errors when a namespace is
  // reopened. Namespace reopening happens when one writes namespace foo {}
  // or namespace foo.* {} more than once.
  suppressions.add('constantProperty');
  suppressTag.type = Array.from(suppressions.values()).sort().join(',');

  return tags;
}

/**
 * A transformer that ensures the emitted JS file has an \@fileoverview comment that contains an
 * \@suppress {checkTypes} annotation by either adding or updating an existing comment.
 */
export function transformFileoverviewCommentFactory(
    options: ts.CompilerOptions, diagnostics: ts.Diagnostic[]) {
  return (): (sourceFile: ts.SourceFile) => ts.SourceFile => {
    function checkNoFileoverviewComments(
        context: ts.Node, comments: jsdoc.SynthesizedCommentWithOriginal[], message: string) {
      for (const comment of comments) {
        const parse = jsdoc.parse(comment);
        if (parse !== null && parse.tags.some(t => FILEOVERVIEW_COMMENT_MARKERS.has(t.tagName))) {
          // Report a warning; this should not break compilation in third party code.
          reportDiagnostic(
              diagnostics, context, message, comment.originalRange, ts.DiagnosticCategory.Warning);
        }
      }
    }

    return (sourceFile: ts.SourceFile) => {
      const text = sourceFile.getFullText();

      let fileComments: ts.SynthesizedComment[] = [];
      const firstStatement = sourceFile.statements.length && sourceFile.statements[0] || null;

      const originalComments = ts.getLeadingCommentRanges(text, 0) || [];
      if (!firstStatement) {
        // In an empty source file, all comments are file-level comments.
        fileComments = synthesizeCommentRanges(sourceFile, originalComments);
      } else {
        // Search for the last comment split from the file with a \n\n. All comments before that are
        // considered fileoverview comments, all comments after that belong to the next
        // statement(s). If none found, comments remains empty, and the code below will insert a new
        // fileoverview comment.
        for (let i = originalComments.length - 1; i >= 0; i--) {
          const end = originalComments[i].end;
          if (!text.substring(end).startsWith('\n\n') &&
              !text.substring(end).startsWith('\r\n\r\n')) {
            continue;
          }
          // This comment is separated from the source file with a double break, marking it (and any
          // preceding comments) as a file-level comment. Split them off and attach them onto a
          // NotEmittedStatement, so that they do not get lost later on.
          const synthesizedComments = jsdoc.synthesizeLeadingComments(firstStatement);
          const notEmitted = ts.createNotEmittedStatement(sourceFile);
          // Modify the comments on the firstStatement in place by removing the file-level comments.
          fileComments = synthesizedComments.splice(0, i + 1);
          // Move the fileComments onto notEmitted.
          ts.setSyntheticLeadingComments(notEmitted, fileComments);
          sourceFile = updateSourceFileNode(
              sourceFile,
              ts.createNodeArray([notEmitted, firstStatement, ...sourceFile.statements.slice(1)]));
          break;
        }


        // Now walk every top level statement and escape/drop any @fileoverview comments found.
        // Closure ignores all @fileoverview comments but the last, so tsickle must make sure not to
        // emit duplicated ones.
        for (let i = 0; i < sourceFile.statements.length; i++) {
          const stmt = sourceFile.statements[i];
          // Accept the NotEmittedStatement inserted above.
          if (i === 0 && stmt.kind === ts.SyntaxKind.NotEmittedStatement) continue;
          const comments = jsdoc.synthesizeLeadingComments(stmt);
          checkNoFileoverviewComments(
              stmt, comments,
              `file comments must be at the top of the file, ` +
                  `separated from the file body by an empty line.`);
        }
      }

      // Closure Compiler considers the *last* comment with @fileoverview (or #externs or
      // @nocompile) that has not been attached to some other tree node to be the file overview
      // comment, and only applies @suppress tags from it. Google-internal tooling considers *any*
      // comment mentioning @fileoverview.
      let fileoverviewIdx = -1;
      let tags: jsdoc.Tag[] = [];
      for (let i = fileComments.length - 1; i >= 0; i--) {
        const parse = jsdoc.parseContents(fileComments[i].text);
        if (parse !== null && parse.tags.some(t => FILEOVERVIEW_COMMENT_MARKERS.has(t.tagName))) {
          fileoverviewIdx = i;
          tags = parse.tags;
          break;
        }
      }

      if (fileoverviewIdx !== -1) {
        checkNoFileoverviewComments(
            firstStatement || sourceFile, fileComments.slice(0, fileoverviewIdx),
            `duplicate file level comment`);
      }

      augmentFileoverviewComments(options, sourceFile, tags);
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

function addNewFileoverviewComment(sf: ts.SourceFile, commentText: string): ts.SourceFile {
  let syntheticFirstStatement = createNotEmittedStatement(sf);
  syntheticFirstStatement = ts.addSyntheticTrailingComment(
      syntheticFirstStatement, ts.SyntaxKind.MultiLineCommentTrivia, commentText, true);
  return updateSourceFileNode(sf, ts.createNodeArray([syntheticFirstStatement, ...sf.statements]));
}
