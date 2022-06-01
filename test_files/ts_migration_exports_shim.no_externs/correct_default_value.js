/**
 *
 * @fileoverview An example export to be re-exported.
 * Generated from: test_files/ts_migration_exports_shim.no_externs/correct_default_value.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.ts_migration_exports_shim.no_externs.correct_default_value');
var module = module || { id: 'test_files/ts_migration_exports_shim.no_externs/correct_default_value.ts' };
goog.require('tslib');
class MyDefaultClass {
    constructor() {
        this.field = 1;
    }
}
exports.MyDefaultClass = MyDefaultClass;
/* istanbul ignore if */
if (false) {
    /**
     * @type {number}
     * @public
     */
    MyDefaultClass.prototype.field;
}
