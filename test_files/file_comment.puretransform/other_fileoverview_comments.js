/** @modName {some_mod} */
goog.module('test_files.file_comment.puretransform.other_fileoverview_comments');
var module = module || { id: 'test_files/file_comment.puretransform/other_fileoverview_comments.ts' };
goog.require('tslib');
// @modName also belongs in a fileoverview comment, so must be merged.
console.log('hello');
