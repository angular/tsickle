/**
 * @fileoverview generator:ts_migration_exports_shim.ts
 * original_file:third_party/javascript/node_modules/tsickle/test_files/ts_migration_exports_shim.no_externs/correct_named.ts
 * pintomodule absent in original_file
 */
goog.module('project.named');
const { MyNamedClass, AnInterface } = goog.require('test_files.ts_migration_exports_shim.no_externs.correct_named');
exports = {
  MyRenamedClass: MyNamedClass,
  AnInterfaceRenamed: AnInterface,
};
