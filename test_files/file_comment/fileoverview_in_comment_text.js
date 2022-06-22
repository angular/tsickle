/**
 *
 * @fileoverview Tests that mere mentions of file overview tags in comment bodies don't get
 * reported as errors.
 *
 * Generated from: test_files/file_comment/fileoverview_in_comment_text.ts
 */
goog.module('test_files.file_comment.fileoverview_in_comment_text');
var module = module || { id: 'test_files/file_comment/fileoverview_in_comment_text.ts' };
goog.require('tslib');
/**
 * This is a function comment that talks about \@fileoverview, but isn't such a comment.
 * @return {void}
 */
function foo() { }
exports.foo = foo;
