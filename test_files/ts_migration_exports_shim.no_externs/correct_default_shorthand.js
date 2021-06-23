/**
 * @fileoverview added by tsickle
 * Generated from: test_files/ts_migration_exports_shim.no_externs/correct_default_shorthand.ts
 * @suppress {checkTypes,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.ts_migration_exports_shim.no_externs.correct_default_shorthand');
var module = module || { id: 'test_files/ts_migration_exports_shim.no_externs/correct_default_shorthand.ts' };
goog.require('tslib');
/**
 * An example export to be re-exported.
 * @record
 */
function MyDefaultType() { }
exports.MyDefaultType = MyDefaultType;
/* istanbul ignore if */
if (COMPILED) {
    /** @type {number} */
    MyDefaultType.prototype.field;
}
goog.tsMigrationDefaultExportsShim('project.CorrectDefaultShorthand');
