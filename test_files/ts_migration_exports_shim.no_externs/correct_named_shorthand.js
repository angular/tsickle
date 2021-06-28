/**
 * @fileoverview added by tsickle
 * Generated from: test_files/ts_migration_exports_shim.no_externs/correct_named_shorthand.ts
 * @suppress {checkTypes,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.ts_migration_exports_shim.no_externs.correct_named_shorthand');
var module = module || { id: 'test_files/ts_migration_exports_shim.no_externs/correct_named_shorthand.ts' };
goog.require('tslib');
/**
 * An example export to be re-exported.
 * @record
 */
function MyIntrface() { }
exports.MyIntrface = MyIntrface;
/* istanbul ignore if */
if (false) {
    /** @type {number} */
    MyIntrface.prototype.field;
}
/** @typedef {string} */
exports.MyTypeLiteral;
/**
 * @record
 */
function MyNotExportedThing() { }
/* istanbul ignore if */
if (false) {
    /** @type {boolean} */
    MyNotExportedThing.prototype.aFieldOnMyNotExportedThing;
}
