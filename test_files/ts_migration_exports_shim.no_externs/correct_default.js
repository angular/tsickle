/**
 * @fileoverview added by tsickle
 * Generated from: test_files/ts_migration_exports_shim.no_externs/correct_default.ts
 * @suppress {checkTypes,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.ts_migration_exports_shim.no_externs.correct_default');
var module = module || { id: 'test_files/ts_migration_exports_shim.no_externs/correct_default.ts' };
goog.require('tslib');
/**
 * An example export to be re-exported.
 */
class MyDefaultClass {
    constructor() {
        this.field = 1;
    }
}
exports.MyDefaultClass = MyDefaultClass;
/* istanbul ignore if */
if (false) {
    /** @type {number} */
    MyDefaultClass.prototype.field;
}
