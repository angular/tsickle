/**
 * @fileoverview See renamed_export_type.ts.
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
goog.module('test_files.renamed_export_type.exporter');
var module = module || { id: 'test_files/renamed_export_type/exporter.ts' };
module = module;
exports = {};
const tsickle_forward_declare_1 = goog.forwardDeclare("test_files.renamed_export_type.declaration");
goog.require('test_files.renamed_export_type.declaration'); // force type-only module to be loaded
/**
 * @record
 */
function SomeInterface() { }
exports.SomeInterface = SomeInterface;
if (false) {
    /** @type {number} */
    SomeInterface.prototype.field;
}
/** @typedef {!tsickle_forward_declare_1.SomeInterface} */
exports.RenamedExport; // re-export typedef
