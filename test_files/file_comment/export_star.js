/**
 *
 * @fileoverview fileoverview comment before export. transformer_util.ts has
 * special logic to handle comments before import/require() calls. This file
 * tests the export * case.
 *
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
goog.module('test_files.file_comment.export_star');
var module = module || { id: 'test_files/file_comment/export_star.ts' };
var comment_before_var_1 = goog.require('test_files.file_comment.comment_before_var');
exports.y = comment_before_var_1.y;
const tsickle_forward_declare_1 = goog.forwardDeclare("test_files.file_comment.comment_before_var");
