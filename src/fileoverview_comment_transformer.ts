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

    let fileoverviewIdx = -1;
    let parsed: {tags: jsdoc.Tag[]}|null = null;
    for (let i = comments.length - 1; i >= 0; i--) {
      const current = jsdoc.parseContents(comments[i].text);
      if (current !== null && current.tags.some(t => FILEOVERVIEW_COMMENT_MARKERS.has(t.tagName))) {
        fileoverviewIdx = i;
        parsed = current;
        break;
      }
    }
    // Add a @suppress {checkTypes} tag to each source file's JSDoc comment,
    // being careful to retain existing comments and their @suppress'ions.
    // Closure Compiler considers the *last* comment with @fileoverview (or @externs or @nocompile)
    // that has not been attached to some other tree node to be the file overview comment, and
    // only applies @suppress tags from it.
    // AJD considers *any* comment mentioning @fileoverview.
    if (!parsed) {
      // No existing comment to merge with, just emit a new one.
      return addNewFileoverviewComment(sf);
    }

    // Add @suppress {checkTypes}, or add to the list in an existing @suppress tag.
    // Closure compiler barfs if there's a duplicated @suppress tag in a file, so the tag must
    // only appear once and be merged.
    const {tags} = parsed;
    const suppressTag = tags.find(t => t.tagName === 'suppress');
    if (suppressTag) {
      const suppressions = suppressTag.type || '';
      const suppressionsList = suppressions.split(',').map(s => s.trim());
      if (suppressionsList.indexOf('checkTypes') === -1) {
        suppressionsList.push('checkTypes');
      }
      suppressTag.type = suppressionsList.join(',');
    } else {
      tags.push({
        tagName: 'suppress',
        type: 'checkTypes,extraRequire',
        text: 'checked by tsc',
      });
    }
    // Closure compiler fails if a tag at the start of the file has @suppress but no @fileoverview.
    if (!tags.find(t => t.tagName === 'fileoverview')) {
      tags.push({tagName: 'fileoverview'});
    }
    const commentText = jsdoc.toStringWithoutStartEnd(tags);
    comments[fileoverviewIdx].text = commentText;
    // sf does not need to be updated, synthesized comments are mutable.
    return sf;
  };
}

function addNewFileoverviewComment(sf: ts.SourceFile): ts.SourceFile {
  const commentText = jsdoc.toStringWithoutStartEnd([
    {tagName: 'fileoverview', text: 'added by tsickle'},
    {tagName: 'suppress', type: 'checkTypes', text: 'checked by tsc'},
  ]);
  let syntheticFirstStatement = createNotEmittedStatement(sf);
  syntheticFirstStatement = ts.addSyntheticTrailingComment(
      syntheticFirstStatement, ts.SyntaxKind.MultiLineCommentTrivia, commentText, true);
  return updateSourceFileNode(sf, ts.createNodeArray([syntheticFirstStatement, ...sf.statements]));
}
