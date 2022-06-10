/**
 * @fileoverview An example export to be re-exported.
 * @suppress {visibility} :test_files_compilation_test
 */

export class MyNamedClass {
  field = 1;
}

export const notDelete = 'actually delete';

goog.tsMigrationExportsShim('project.named', {
  /* Comments should be ignored. */
  MyRenamedClass: MyNamedClass,
  // Test renaming symbol to a reserved keyword.
  delete: notDelete,
});
goog.tsMigrationExportsShimDeclareLegacyNamespace();
