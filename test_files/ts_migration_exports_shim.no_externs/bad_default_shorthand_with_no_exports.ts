/**
 * @fileoverview negative tests for the tsMigrationDefaultExportsShim
 * transformation.
 *
 * Suppress expected errors for :test_files_compilation_test
 * @suppress {checkTypes,visibility}
 */

// Default exports in JavaScript only make sense when the corresponding
// TypeScript has exactly one export.
goog.tsMigrationDefaultExportsShim('requires.exactly.one.export');
