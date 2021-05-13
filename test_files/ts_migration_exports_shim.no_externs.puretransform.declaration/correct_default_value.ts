/**
 * @fileoverview An example export to be re-exported.
 * @suppress {visibility} :test_files_compilation_test
 */

export class MyDefaultClass {
  field = 1;
}

goog.tsMigrationExportsShim('project.MyDefaultClass', MyDefaultClass);
