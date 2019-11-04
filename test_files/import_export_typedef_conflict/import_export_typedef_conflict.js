/**
 *
 * @fileoverview reproduces a problem where importing a symbol that's also a typedef in the local
 * scope would cause a duplicate exports assignment, once for the imported symbol and once for the
 * exported typedef.
 *
 * Generated from: test_files/import_export_typedef_conflict/import_export_typedef_conflict.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.import_export_typedef_conflict.import_export_typedef_conflict');
var module = module || { id: 'test_files/import_export_typedef_conflict/import_export_typedef_conflict.ts' };
module = module;
const tsickle_exporter_1 = goog.requireType("test_files.import_export_typedef_conflict.exporter");
const ConflictingName = goog.require('test_files.import_export_typedef_conflict.exporter');
/** @typedef {number} */
exports.ConflictingName;
/** @type {number} */
exports.myVariable = ConflictingName.x;
