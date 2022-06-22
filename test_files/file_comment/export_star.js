/**
 *
 * @fileoverview fileoverview comment before export. transformer_util.ts has
 * special logic to handle comments before import/require() calls. This file
 * tests the export * case.
 *
 * Generated from: test_files/file_comment/export_star.ts
 */
goog.module('test_files.file_comment.export_star');
var module = module || { id: 'test_files/file_comment/export_star.ts' };
goog.require('tslib');
const tsickle_comment_before_var_1 = goog.requireType("test_files.file_comment.comment_before_var");
const comment_before_var_1 = goog.require('test_files.file_comment.comment_before_var');
exports.y = comment_before_var_1.y;
