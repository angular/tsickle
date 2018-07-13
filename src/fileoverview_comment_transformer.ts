/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as jsdoc from './jsdoc';
import {createNotEmittedStatement, synthesizeCommentRanges, updateSourceFileNode} from './transformer_util';
import * as ts from './typescript';

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
 * @param tags Comment as parsed list of tags; modified in-place.
 */
function augmentFileoverviewComments(tags: jsdoc.Tag[]) {
  // Ensure we start with a @fileoverview.
  if (!tags.find(t => t.tagName === 'fileoverview')) {
    tags.splice(0, 0, {tagName: 'fileoverview', text: 'added by tsickle'});
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
  suppressTag.type = Array.from(suppressions.values()).sort().join(',');

  return tags;
}

/**
 * A transformer that ensures the emitted JS file has an \@fileoverview comment that contains an
 * \@suppress {checkTypes} annotation by either adding or updating an existing comment.
 */
export function transformFileoverviewComment(context: ts.TransformationContext):
    (sf: ts.SourceFile) => ts.SourceFile {
  return (sf: ts.SourceFile) => {
    const text = sf.getFullText();

    let fileComments: ts.SynthesizedComment[] = [];
    const firstStatement = sf.statements.length && sf.statements[0] || null;

    const originalComments = ts.getLeadingCommentRanges(text, 0) || [];
    if (!firstStatement) {
      // In an empty source file, all comments are file-level comments.
      fileComments = synthesizeCommentRanges(sf, originalComments);
    } else {
      // Search for the first comment split from the file with a \n\n. All comments before that are
      // considered fileoverview comments, all comments after that belong to the next statement(s).
      // If none found, comments remains empty, and the code below will insert a new fileoverview
      // comment.
      for (let i = 0; i < originalComments.length; i++) {
        const end = originalComments[i].end;
        if (!text.substring(end).startsWith('\n\n')) continue;
        // This comment is separated from the source file with a double break, marking it (and any
        // preceding comments) as a file-level comment. Split them off and attach them onto a
        // NotEmittedStatement, so that they do not get lost later on.
        const synthesizedComments = jsdoc.synthesizeLeadingComments(firstStatement);
        const notEmitted = ts.createNotEmittedStatement(sf);
        // Modify the comments on the firstStatement in place by removing the file-level comments.
        fileComments = synthesizedComments.splice(0, i + 1);
        // Move the fileComments onto notEmitted.
        ts.setSyntheticLeadingComments(notEmitted, fileComments);
        // TODO(martinprobst): consider checking here whether any of the trailing comments contains
        // an @fileoverview etc, and reporting an error if so.
        sf = updateSourceFileNode(
            sf, ts.createNodeArray([notEmitted, firstStatement, ...sf.statements.slice(1)]));
        break;
      }
    }

    // Closure Compiler considers the *last* comment with @fileoverview (or @externs or @nocompile)
    // that has not been attached to some other tree node to be the file overview comment, and
    // only applies @suppress tags from it.
    // AJD considers *any* comment mentioning @fileoverview.
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

    augmentFileoverviewComments(tags);
    const commentText = jsdoc.toStringWithoutStartEnd(tags);

    if (fileoverviewIdx < 0) {
      // No existing comment to merge with, just emit a new one.
      return addNewFileoverviewComment(sf, commentText);
    }

    fileComments[fileoverviewIdx].text = commentText;
    // sf does not need to be updated, synthesized comments are mutable.
    return sf;
  };
}

function addNewFileoverviewComment(sf: ts.SourceFile, commentText: string): ts.SourceFile {
  let syntheticFirstStatement = createNotEmittedStatement(sf);
  syntheticFirstStatement = ts.addSyntheticTrailingComment(
      syntheticFirstStatement, ts.SyntaxKind.MultiLineCommentTrivia, commentText, true);
  return updateSourceFileNode(sf, ts.createNodeArray([syntheticFirstStatement, ...sf.statements]));
}
