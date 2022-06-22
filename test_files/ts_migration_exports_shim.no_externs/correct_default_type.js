/**
 *
 * @fileoverview An example export to be re-exported.
 * Generated from: test_files/ts_migration_exports_shim.no_externs/correct_default_type.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.ts_migration_exports_shim.no_externs.correct_default_type');
var module = module || { id: 'test_files/ts_migration_exports_shim.no_externs/correct_default_type.ts' };
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
