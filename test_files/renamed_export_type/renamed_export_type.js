/**
 * @fileoverview Tests that renamed exported symbols are referenced with they renamed name.
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
goog.module('test_files.renamed_export_type.renamed_export_type');
var module = module || { id: 'test_files/renamed_export_type/renamed_export_type.ts' };
module = module;
exports = {};
const tsickle_forward_declare_1 = goog.forwardDeclare("test_files.renamed_export_type.exporter");
goog.require('test_files.renamed_export_type.exporter'); // force type-only module to be loaded
const tsickle_forward_declare_2 = goog.forwardDeclare("test_files.renamed_export_type.declaration");
// This declaration must use RenamedExport as its name, not
/** @type {(null|!tsickle_forward_declare_2.SomeInterface)} */
const usesRenamedExport = null;
console.log(usesRenamedExport);
