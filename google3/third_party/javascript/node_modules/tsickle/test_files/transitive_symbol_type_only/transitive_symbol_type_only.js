/**
 *
 * @fileoverview This file uses a type alias that references a type defined in another file. The
 * test makes sure there is no hard goog.require for the transitive file, as that breaks strict
 * dependency checking in some systems.
 *
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.transitive_symbol_type_only.transitive_symbol_type_only');
var module = module || { id: 'test_files/transitive_symbol_type_only/transitive_symbol_type_only.ts' };
module = module;
exports = {};
const tsickle_reexporter_1 = goog.requireType("test_files.transitive_symbol_type_only.reexporter");
const tsickle_exporter_2 = goog.requireType("test_files.transitive_symbol_type_only.exporter");
/** @type {(null|string|!tsickle_exporter_2.ExportedInterface)} */
exports.val = 'val';
