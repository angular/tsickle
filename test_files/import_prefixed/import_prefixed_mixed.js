/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.import_prefixed.import_prefixed_mixed');
var module = module || { id: 'test_files/import_prefixed/import_prefixed_mixed.ts' };
module = module;
exports = {};
const tsickle_forward_declare_1 = goog.forwardDeclare("test_files.import_prefixed.exporter");
// This file imports exporter with a prefix import (* as ...), and then uses the
// import in a type and in a value position.
const exporter = goog.require('test_files.import_prefixed.exporter');
/** @type {(string|number)} */
let someVar;
console.log(exporter.valueExport);
