/**
 *
 * @fileoverview This is a fileoverview comment preceding a side-effect import.
 * transformer_util.ts has special logic to handle comments before
 * import/require() calls. This file tests the side-effect import case.
 *
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
goog.module('test_files.file_comment.side_effect_import');
var module = module || { id: 'test_files/file_comment/side_effect_import.ts' };
var tsickle_module_1_ = goog.require('test_files.file_comment.file_comment');
