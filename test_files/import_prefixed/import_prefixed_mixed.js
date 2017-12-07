/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
goog.module('test_files.import_prefixed.import_prefixed_mixed');var module = module || {id: 'test_files/import_prefixed/import_prefixed_mixed.js'};// This file imports exporter with a prefix import (* as ...), and then uses the
// import in a type and in a value position.

var exporter = goog.require('test_files.import_prefixed.exporter');
const tsickle_forward_declare_1 = goog.forwardDeclare("test_files.import_prefixed.exporter");
let /** @type {tsickle_forward_declare_1.TypeExport} */ someVar;
console.log(exporter.valueExport);
