/**
 * @fileoverview Regression test to ensure local type symbols can be exported.
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.export_local_type.export_local_type');
var module = module || { id: 'test_files/export_local_type/export_local_type.ts' };
module = module;
exports = {};
/**
 * @record
 */
function LocalInterface() { }
if (false) {
    /** @type {string} */
    LocalInterface.prototype.field;
}
/** @typedef {!LocalInterface} */
exports.LocalInterface; // re-export typedef
/** @typedef {!LocalInterface} */
exports.AliasedName; // re-export typedef
