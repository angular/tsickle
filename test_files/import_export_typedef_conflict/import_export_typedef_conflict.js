/**
 *
 * @fileoverview reproduces a problem where importing a symbol that's also a typedef in the local
 * scope would cause a duplicate exports assignment, once for the imported symbol and once for the
 * exported typedef.
 *
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.import_export_typedef_conflict.import_export_typedef_conflict');
var module = module || { id: 'test_files/import_export_typedef_conflict/import_export_typedef_conflict.ts' };
module = module;
exports = {};
const tsickle_forward_declare_1 = goog.forwardDeclare("test_files.import_export_typedef_conflict.exporter");
const ConflictingName = goog.require('test_files.import_export_typedef_conflict.exporter');
/** @typedef {number} */
exports.ConflictingName;
/** @type {number} */
exports.myVariable = ConflictingName.x;
