/**
 * @fileoverview Class handling code does not special cases comments preceding
 * it before its JSDoc block. This comment would not get emitted if detached
 * source file comments were not emitted separately.
 */
goog.module('test_files.file_comment.puretransform.comment_before_class');
var module = module || { id: 'test_files/file_comment.puretransform/comment_before_class.ts' };
goog.require('tslib');
class Clazz {
}
exports.Clazz = Clazz;
