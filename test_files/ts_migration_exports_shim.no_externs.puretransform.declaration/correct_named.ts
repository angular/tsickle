/**
 * @fileoverview An example export to be re-exported.
 * @suppress {visibility} :test_files_compilation_test
 */

export class MyNamedClass {
  field = 1;
}

goog.tsMigrationExportsShim('project.named', {MyRenamedClass: MyNamedClass});
goog.tsMigrationExportsShimDeclareLegacyNamespace();
