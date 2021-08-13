// test_files/ts_migration_exports_shim.no_externs.puretransform.declaration/bad.ts(23,1): error TS0: at most one call to any of goog.tsMigrationExportsShim, goog.tsMigrationDefaultExportsShim, goog.tsMigrationNamedExportsShim is allowed per file
// test_files/ts_migration_exports_shim.no_externs.puretransform.declaration/bad.ts(37,3): error TS0: goog.tsMigrationExportsShim is only allowed in top level statements
// test_files/ts_migration_exports_shim.no_externs.puretransform.declaration/bad.ts(24,3): error TS0: export must be an exported symbol of the module
// test_files/ts_migration_exports_shim.no_externs.puretransform.declaration/bad.ts(25,3): error TS0: exports object must only contain (shorthand) properties
// test_files/ts_migration_exports_shim.no_externs.puretransform.declaration/bad.ts(28,11): error TS0: export values must be plain identifiers
// test_files/ts_migration_exports_shim.no_externs.puretransform.declaration/bad.ts(29,14): error TS0: export values must be plain identifiers
// test_files/ts_migration_exports_shim.no_externs.puretransform.declaration/bad.ts(31,14): error TS0: export must be an exported symbol of the module
/**
 * @fileoverview negative tests for the tsMigrationExportsShim transformation.
 *
 * Suppress expected errors for :test_files_compilation_test
 * @suppress {checkTypes,visibility}
 */
goog.module('test_files.ts_migration_exports_shim.no_externs.puretransform.declaration.bad');
var module = module || { id: 'test_files/ts_migration_exports_shim.no_externs.puretransform.declaration/bad.ts' };
goog.require('tslib');
exports.exported = 1;
exports.nested = {
    X: 1
};
const notExported = 1;
goog.tsMigrationExportsShim('bad.exports', {
    notExported,
    method() {
        return 1;
    },
    nested: { exported: exports.exported },
    navigated: exports.nested.X,
    foo: {},
    bar: {},
});
goog.tsMigrationExportsShim('only.one.allowed', exports.exported);
function f() {
    goog.tsMigrationExportsShim('must.be.top.level', {});
}
