/**
 * @fileoverview This is a fileoverview comment preceding a side-effect import.
 * transformer_util.ts has special logic to handle comments before
 * import/require() calls. This file tests the side-effect import case.
 */
goog.module('test_files.file_comment.puretransform.side_effect_import');
var module = module || { id: 'test_files/file_comment.puretransform/side_effect_import.ts' };
goog.require('tslib');
goog.require('test_files.file_comment.puretransform.file_comment');
