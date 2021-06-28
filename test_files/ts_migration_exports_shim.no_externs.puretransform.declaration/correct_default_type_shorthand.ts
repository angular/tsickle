/**
 * @fileoverview An example export to be re-exported.
 * @suppress {visibility} :test_files_compilation_test
 */

export class MyDefaultType {
  shouldBeANumber: number;
}

goog.tsMigrationDefaultExportsShim('project.MyDefaultType.shorthand');
