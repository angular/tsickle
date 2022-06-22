// test_files/ts_migration_exports_shim.no_externs/bad_dln_only.ts(12,1): error TS0: goog.tsMigrationExportsShimDeclareLegacyNamespace requires a goog.tsMigration*ExportsShim call as well
/**
 *
 * @fileoverview negative test for the tsMigrationExportsShim transformation for
 * tsMigrationExportsShimDeclareLegacyNamespace.
 *
 * Suppress expected errors for :test_files_compilation_test
 * Generated from: test_files/ts_migration_exports_shim.no_externs/bad_dln_only.ts
 * @suppress {checkTypes,visibility}
 *
 */
goog.module('test_files.ts_migration_exports_shim.no_externs.bad_dln_only');
var module = module || { id: 'test_files/ts_migration_exports_shim.no_externs/bad_dln_only.ts' };
goog.require('tslib');
/** @type {number} */
exports.exported = 1;
// Needs normal TSMES call as well.
goog.tsMigrationExportsShimDeclareLegacyNamespace();
