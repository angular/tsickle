/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as jsdoc from './jsdoc';
import {createNotEmittedStatement, updateSourceFileNode} from './transformer_util';
import * as ts from './typescript';

/**
 * A set of JSDoc tags that mark a comment as a fileoverview comment. These are recognized by other
 * pieces of infrastructure (Closure Compiler, module system, ...).
 */
const FILEOVERVIEW_COMMENT_MARKERS: ReadonlySet<string> =
    new Set(['fileoverview', 'externs', 'modName', 'mods', 'pintomodule']);

/**
 * Returns true if the given comment is a \@fileoverview style comment in the Closure sense, i.e. a
 * comment that has JSDoc tags marking it as a fileoverview comment.
 * Note that this is different from TypeScript's understanding of the concept, where a file comment
 * is a comment separated from the rest of the file by a double newline.
 */
export function isClosureFileoverviewComment(text: string) {
  const current = jsdoc.parse(text);
  return current !== null && current.tags.some(t => FILEOVERVIEW_COMMENT_MARKERS.has(t.tagName));
}

/**
 * Given a parsed @fileoverview comment, ensures it has all the attributes we need.
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
    let comments: ts.SynthesizedComment[] = [];
    // Use trailing comments because that's what transformer_util.ts creates (i.e. by convention).
    if (sf.statements.length && sf.statements[0].kind === ts.SyntaxKind.NotEmittedStatement) {
      comments = ts.getSyntheticTrailingComments(sf.statements[0]) || [];
    }

    // Closure Compiler considers the *last* comment with @fileoverview (or @externs or @nocompile)
    // that has not been attached to some other tree node to be the file overview comment, and
    // only applies @suppress tags from it.
    // AJD considers *any* comment mentioning @fileoverview.
    let fileoverviewIdx = -1;
    let tags: jsdoc.Tag[] = [];
    for (let i = comments.length - 1; i >= 0; i--) {
      const parse = jsdoc.parseContents(comments[i].text);
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

    comments[fileoverviewIdx].text = commentText;
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
