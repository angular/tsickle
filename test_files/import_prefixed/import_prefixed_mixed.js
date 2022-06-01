/**
 * @fileoverview added by tsickle
 * Generated from: test_files/import_prefixed/import_prefixed_mixed.ts
 */
goog.module('test_files.import_prefixed.import_prefixed_mixed');
var module = module || { id: 'test_files/import_prefixed/import_prefixed_mixed.ts' };
goog.require('tslib');
const tsickle_exporter_1 = goog.requireType("test_files.import_prefixed.exporter");
// This file imports exporter with a prefix import (* as ...), and then uses the
// import in a type and in a value position.
const exporter = goog.require('test_files.import_prefixed.exporter');
/** @type {(string|number)} */
let someVar;
console.log(exporter.valueExport);
