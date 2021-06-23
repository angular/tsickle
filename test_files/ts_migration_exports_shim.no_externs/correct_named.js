/**
 * @fileoverview added by tsickle
 * Generated from: test_files/ts_migration_exports_shim.no_externs/correct_named.ts
 * @suppress {checkTypes,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.ts_migration_exports_shim.no_externs.correct_named');
var module = module || { id: 'test_files/ts_migration_exports_shim.no_externs/correct_named.ts' };
goog.require('tslib');
/**
 * An example export to be re-exported.
 */
class MyNamedClass {
    constructor() {
        this.field = 1;
    }
}
exports.MyNamedClass = MyNamedClass;
/* istanbul ignore if */
if (COMPILED) {
    /** @type {number} */
    MyNamedClass.prototype.field;
}
/**
 * @record
 */
function AnInterface() { }
exports.AnInterface = AnInterface;
/* istanbul ignore if */
if (COMPILED) {
    /** @type {number} */
    AnInterface.prototype.shouldBeANumber;
}
