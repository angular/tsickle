/**
 * @fileoverview An example export to be re-exported.
 * @suppress {visibility} :test_files_compilation_test
 */

const notExport = 'actually export';
// Test exporting using a reserved keyword as a name.
export {notExport as export};

goog.tsMigrationDefaultExportsShim('project.export');
