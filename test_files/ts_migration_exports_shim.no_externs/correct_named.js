/**
 *
 * @fileoverview An example export to be re-exported.
 * Generated from: test_files/ts_migration_exports_shim.no_externs/correct_named.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.ts_migration_exports_shim.no_externs.correct_named');
var module = module || { id: 'test_files/ts_migration_exports_shim.no_externs/correct_named.ts' };
goog.require('tslib');
class MyNamedClass {
    constructor() {
        this.field = 1;
    }
}
exports.MyNamedClass = MyNamedClass;
/* istanbul ignore if */
if (false) {
    /**
     * @type {number}
     * @public
     */
    MyNamedClass.prototype.field;
}
/**
 * @record
 */
function AnInterface() { }
exports.AnInterface = AnInterface;
/* istanbul ignore if */
if (false) {
    /**
     * @type {number}
     * @public
     */
    AnInterface.prototype.shouldBeANumber;
}
