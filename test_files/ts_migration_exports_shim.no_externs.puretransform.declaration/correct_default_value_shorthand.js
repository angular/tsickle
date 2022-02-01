/**
 * @fileoverview An example export to be re-exported.
 * @suppress {visibility} :test_files_compilation_test
 */
goog.module('test_files.ts_migration_exports_shim.no_externs.puretransform.declaration.correct_default_value_shorthand');
var module = module || { id: 'test_files/ts_migration_exports_shim.no_externs.puretransform.declaration/correct_default_value_shorthand.ts' };
goog.require('tslib');
class MyDefaultClass {
    constructor() {
        this.field = 1;
    }
}
exports.MyDefaultClass = MyDefaultClass;
