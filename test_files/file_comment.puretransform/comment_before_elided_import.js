/**
 * @fileoverview This is a comment before an import, where the import will be elided but the comment
 * must be kept.
 */
goog.module('test_files.file_comment.puretransform.comment_before_elided_import');
var module = module || { id: 'test_files/file_comment.puretransform/comment_before_elided_import.ts' };
goog.require('tslib');
const x = null;
console.log(x);
