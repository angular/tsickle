// test_files/ts_migration_exports_shim.no_externs/bad_default_shorthand_with_more_than_one_export.ts(14,1): error TS0: can only call goog.tsMigrationDefaultExportsShim when there is exactly one export.
/**
 *
 * @fileoverview negative tests for the tsMigrationDefaultExportsShim
 * transformation.
 *
 * Suppress expected errors for :test_files_compilation_test
 * Generated from: test_files/ts_migration_exports_shim.no_externs/bad_default_shorthand_with_more_than_one_export.ts
 * @suppress {checkTypes,visibility}
 *
 */
goog.module('test_files.ts_migration_exports_shim.no_externs.bad_default_shorthand_with_more_than_one_export');
var module = module || { id: 'test_files/ts_migration_exports_shim.no_externs/bad_default_shorthand_with_more_than_one_export.ts' };
goog.require('tslib');
/** @type {number} */
exports.Foo = 42;
/**
 * @record
 */
function I() { }
exports.I = I;
// Default exports in JavaScript only make sense when the corresponding
// TypeScript has exactly one export.
goog.tsMigrationDefaultExportsShim('requires.exactly.one.export');
