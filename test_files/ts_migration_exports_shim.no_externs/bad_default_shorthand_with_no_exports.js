// test_files/ts_migration_exports_shim.no_externs/bad_default_shorthand_with_no_exports.ts(11,1): error TS0: can only call goog.tsMigrationDefaultExportsShim when there is exactly one export.
/**
 *
 * @fileoverview negative tests for the tsMigrationDefaultExportsShim
 * transformation.
 *
 * Suppress expected errors for :test_files_compilation_test
 * Generated from: test_files/ts_migration_exports_shim.no_externs/bad_default_shorthand_with_no_exports.ts
 * @suppress {checkTypes,visibility}
 *
 */
goog.module('test_files.ts_migration_exports_shim.no_externs.bad_default_shorthand_with_no_exports');
var module = module || { id: 'test_files/ts_migration_exports_shim.no_externs/bad_default_shorthand_with_no_exports.ts' };
goog.require('tslib');
// Default exports in JavaScript only make sense when the corresponding
// TypeScript has exactly one export.
goog.tsMigrationDefaultExportsShim('requires.exactly.one.export');
