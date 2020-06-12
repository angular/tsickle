/**
 * @fileoverview fileoverview comment before import. transformer_util.ts has
 * special logic to handle comments before import/require() calls. This file
 * tests the regular import case.
 */
goog.module('test_files.file_comment.puretransform.before_import');
var module = module || { id: 'test_files/file_comment.puretransform/before_import.ts' };
goog.require('tslib');
const comment_before_var_1 = goog.require('test_files.file_comment.puretransform.comment_before_var');
console.log(comment_before_var_1.y);
