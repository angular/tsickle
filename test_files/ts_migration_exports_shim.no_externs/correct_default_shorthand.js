/**
 *
 * @fileoverview An example export to be re-exported.
 * Generated from: test_files/ts_migration_exports_shim.no_externs/correct_default_shorthand.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.ts_migration_exports_shim.no_externs.correct_default_shorthand');
var module = module || { id: 'test_files/ts_migration_exports_shim.no_externs/correct_default_shorthand.ts' };
goog.require('tslib');
/**
 * @record
 */
function MyDefaultType() { }
exports.MyDefaultType = MyDefaultType;
/* istanbul ignore if */
if (false) {
    /**
     * @type {number}
     * @public
     */
    MyDefaultType.prototype.field;
}
