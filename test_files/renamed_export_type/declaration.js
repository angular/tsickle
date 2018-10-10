/**
 * @fileoverview See renamed_export_type.ts.
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
goog.module('test_files.renamed_export_type.declaration');
var module = module || { id: 'test_files/renamed_export_type/declaration.ts' };
module = module;
exports = {};
/**
 * @record
 */
function SomeInterface() { }
exports.SomeInterface = SomeInterface;
if (false) {
    /** @type {string} */
    SomeInterface.prototype.field;
}
