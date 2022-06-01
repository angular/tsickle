// test_files/file_comment/multiple_comments.ts(8,1): warning TS0: duplicate file level comment
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @fileoverview This comment is ignored by Closure compiler.
 * @suppress {undefinedVars}
 */
/**
 *
 * @fileoverview The last fileoverview actually takes effect.
 * Generated from: test_files/file_comment/multiple_comments.ts
 * @suppress {const}
 *
 */
/** Here's another trailing comment */
goog.module('test_files.file_comment.multiple_comments');
var module = module || { id: 'test_files/file_comment/multiple_comments.ts' };
goog.require('tslib');
/**
 * @return {void}
 */
function f() {
    // Make sure the {const} suppression above is maintained.
    /**
     * @const
     * @type {number}
     */
    let x = 3;
    x = 4;
}
