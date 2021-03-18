// test_files/ts_migration_exports_shim.no_externs.puretransform/bad.ts(21,1):
// error TS0: at most one goog.tsMigrationExportsShim is allowed per file
// test_files/ts_migration_exports_shim.no_externs.puretransform/bad.ts(24,3):
// error TS0: goog.tsMigrationExportsShim is only allowed in top level
// statements
// test_files/ts_migration_exports_shim.no_externs.puretransform/bad.ts(13,3):
// error TS0: export must be an exported symbol of the module
// test_files/ts_migration_exports_shim.no_externs.puretransform/bad.ts(14,3):
// error TS0: exports object must only contain (shorthand) properties
// test_files/ts_migration_exports_shim.no_externs.puretransform/bad.ts(17,11):
// error TS0: export values must be plain identifiers
// test_files/ts_migration_exports_shim.no_externs.puretransform/bad.ts(18,14):
// error TS0: export values must be plain identifiers
/**
 * @fileoverview negative tests for the tsMigrationExportsShim transformation.
 */
goog.module('test_files.ts_migration_exports_shim.no_externs.puretransform.bad');
var module = module || {
  id: 'test_files/ts_migration_exports_shim.no_externs.puretransform/bad.ts'
};
goog.require('tslib');
exports.exported = 1;
exports.nested = {
  X: 1
};
const notExported = 1;
goog.loadedModules_['bad.exports'] = {
  exports: {
    notExported,
    method() {
      return 1;
    },
    nested: {exported: exports.exported},
    navigated: exports.nested.X,
  },
  type: goog.ModuleType.GOOG,
  moduleId: 'bad.exports'
};
goog.loadedModules_['only.one.allowed'] = {
  exports: exports.exported,
  type: goog.ModuleType.GOOG,
  moduleId: 'only.one.allowed'
};
function f() {
  goog.tsMigrationExportsShim('must.be.top.level', {});
}
