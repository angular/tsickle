// test_files/ts_migration_exports_shim.no_externs/bad.ts(35,1): error TS0: at most one goog.tsMigrationExportsShim is allowed per file
// test_files/ts_migration_exports_shim.no_externs/bad.ts(39,3): error TS0: goog.tsMigrationExportsShim is only allowed in top level statements
// test_files/ts_migration_exports_shim.no_externs/bad.ts(23,3): error TS0: export must be an exported symbol of the module
// test_files/ts_migration_exports_shim.no_externs/bad.ts(25,3): error TS0: exports object must only contain (shorthand) properties
// test_files/ts_migration_exports_shim.no_externs/bad.ts(29,11): error TS0: export values must be plain identifiers
// test_files/ts_migration_exports_shim.no_externs/bad.ts(31,14): error TS0: export values must be plain identifiers
/**
 *
 * @fileoverview negative tests for the tsMigrationExportsShim transformation.
 *
 * Suppress expected errors for :test_files_compilation_test
 * Generated from: test_files/ts_migration_exports_shim.no_externs/bad.ts
 * @suppress {checkTypes,extraRequire,missingOverride,missingRequire,missingReturn,undefinedNames,unusedPrivateMembers,uselessCode,visibility}
 *
 */
// Allowed to be exported by tsmes.
goog.module('test_files.ts_migration_exports_shim.no_externs.bad');
var module = module || { id: 'test_files/ts_migration_exports_shim.no_externs/bad.ts' };
goog.require('tslib');
/** @type {number} */
exports.exported = 1;
// Allowed to be exported by tsmes.
/** @type {{X: number}} */
exports.nested = {
    // Cannot be exported by tsmes.
    X: 1
};
// Cannot be exported by tsmes.
/** @type {number} */
const notExported = 1;
/**
 * @return {void}
 */
function f() {
    // tsmes calls must be module-level
    goog.tsMigrationExportsShim('must.be.top.level', {});
}
