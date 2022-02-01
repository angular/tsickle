/**
 * @fileoverview An example export to be re-exported.
 * @suppress {visibility} :test_files_compilation_test
 */
goog.module('test_files.ts_migration_exports_shim.no_externs.puretransform.declaration.correct_named');
var module = module || { id: 'test_files/ts_migration_exports_shim.no_externs.puretransform.declaration/correct_named.ts' };
goog.require('tslib');
class MyNamedClass {
    constructor() {
        this.field = 1;
    }
}
exports.MyNamedClass = MyNamedClass;
