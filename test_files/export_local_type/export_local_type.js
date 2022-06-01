/**
 *
 * @fileoverview Regression test to ensure local type symbols can be exported.
 * Generated from: test_files/export_local_type/export_local_type.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.export_local_type.export_local_type');
var module = module || { id: 'test_files/export_local_type/export_local_type.ts' };
goog.require('tslib');
/**
 * @record
 */
function LocalInterface() { }
/* istanbul ignore if */
if (false) {
    /**
     * @type {string}
     * @public
     */
    LocalInterface.prototype.field;
}
/** @typedef {!LocalInterface} */
exports.LocalInterface; // re-export typedef
/** @typedef {!LocalInterface} */
exports.AliasedName; // re-export typedef
