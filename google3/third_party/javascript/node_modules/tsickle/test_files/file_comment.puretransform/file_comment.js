goog.module('test_files.file_comment.puretransform.file_comment');
var module = module || { id: 'test_files/file_comment.puretransform/file_comment.ts' };
module = module;
exports = {};
// This test verifies that initial comments don't confuse offsets.
function foo() {
    return 'foo';
}
// More text here to exhibit the problem.
