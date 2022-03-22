/**
 * @fileoverview negative test for the tsMigrationExportsShim transformation for
 * tsMigrationExportsShimDeclareLegacyNamespace.
 *
 * Suppress expected errors for :test_files_compilation_test
 * @suppress {checkTypes,visibility}
 */

export const exported = 1;

// Needs normal TSMES call as well.
goog.tsMigrationExportsShimDeclareLegacyNamespace();
