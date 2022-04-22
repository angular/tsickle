/**
 * @fileoverview An example export to be re-exported.
 * @suppress {visibility} :test_files_compilation_test
 */

export class MyNamedClass {
  field = 1;
}

const notDelete = 'actually delete';
// Test exporting symbol as a reserved keyword.
export {notDelete as delete};

goog.tsMigrationNamedExportsShim('project.named.shorthand');
