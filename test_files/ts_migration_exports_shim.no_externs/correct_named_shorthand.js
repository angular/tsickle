/**
 *
 * @fileoverview An example export to be re-exported.
 * Generated from: test_files/ts_migration_exports_shim.no_externs/correct_named_shorthand.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.ts_migration_exports_shim.no_externs.correct_named_shorthand');
var module = module || { id: 'test_files/ts_migration_exports_shim.no_externs/correct_named_shorthand.ts' };
goog.require('tslib');
/**
 * @record
 */
function MyIntrface() { }
exports.MyIntrface = MyIntrface;
/* istanbul ignore if */
if (false) {
    /**
     * @type {number}
     * @public
     */
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
    /**
     * @type {boolean}
     * @public
     */
    MyNotExportedThing.prototype.aFieldOnMyNotExportedThing;
}
