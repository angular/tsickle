/**
 * @modName {some_mod}
 * @suppress {checkTypes} checked by tsc
 * @fileoverview
 */
goog.module('test_files.file_comment.other_fileoverview_comments');
var module = module || { id: 'test_files/file_comment/other_fileoverview_comments.ts' };
// @modName also belongs in a fileoverview comment, so must be merged.
console.log('hello');
