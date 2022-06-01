/**
 *
 * @fileoverview fileoverview comment before import. transformer_util.ts has
 * special logic to handle comments before import/require() calls. This file
 * tests the regular import case.
 *
 * Generated from: test_files/file_comment/before_import.ts
 */
goog.module('test_files.file_comment.before_import');
var module = module || { id: 'test_files/file_comment/before_import.ts' };
goog.require('tslib');
const tsickle_comment_before_var_1 = goog.requireType("test_files.file_comment.comment_before_var");
const comment_before_var_1 = goog.require('test_files.file_comment.comment_before_var');
console.log(comment_before_var_1.y);
