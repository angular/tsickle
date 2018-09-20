/**
 *
 * @fileoverview Tests that mere mentions of file overview tags in comment bodies don't get
 * reported as errors.
 *
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
goog.module('test_files.file_comment.fileoverview_in_comment_text');
var module = module || { id: 'test_files/file_comment/fileoverview_in_comment_text.ts' };
module = module;
exports = {};
/**
 * This is a function comment that talks about \@fileoverview, but isn't such a comment.
 * @return {void}
 */
function foo() { }
exports.foo = foo;
