// test_files/ts_migration_exports_shim.no_externs/bad.ts(32,1): error TS0: at
// most one goog.tsMigrationExportsShim is allowed per file
// test_files/ts_migration_exports_shim.no_externs/bad.ts(36,3): error TS0:
// goog.tsMigrationExportsShim is only allowed in top level statements
// test_files/ts_migration_exports_shim.no_externs/bad.ts(20,3): error TS0:
// export must be an exported symbol of the module
// test_files/ts_migration_exports_shim.no_externs/bad.ts(22,3): error TS0:
// exports object must only contain (shorthand) properties
// test_files/ts_migration_exports_shim.no_externs/bad.ts(26,11): error TS0:
// export values must be plain identifiers
// test_files/ts_migration_exports_shim.no_externs/bad.ts(28,14): error TS0:
// export values must be plain identifiers
/**
 *
 * @fileoverview negative tests for the tsMigrationExportsShim transformation.
 *
 * Generated from: test_files/ts_migration_exports_shim.no_externs/bad.ts
 * @suppress {checkTypes,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode}
 * checked by tsc
 */
// Allowed to be exported by tsmes.
goog.module('test_files.ts_migration_exports_shim.no_externs.bad');
var module =
    module || {id: 'test_files/ts_migration_exports_shim.no_externs/bad.ts'};
goog.require('tslib');
/** @type {number} */
exports.exported = 1;
// Allowed to be exported by tsmes.
/** @type {{X: number}} */
exports.nested = {
  // Cannot be exported by tsmes.
  X: 1
};
// Cannot be exported by tsmes.
/** @type {number} */
const notExported = 1;
// Only module-level exports can be exported by tsmes
goog.loadedModules_['bad.exports'] = {
  exports: {
    // This symbol is not exported
    notExported,
    // Method declarations are not module-level exports
    /**
     * @return {number}
     */
    method() {
      return 1;
    },
    // Properties are not module-level exports
    nested: {exported: exports.exported},
    // Properties are not module-level exports
    navigated: exports.nested.X,
  },
  type: goog.ModuleType.GOOG,
  moduleId: 'bad.exports'
};
// Only 0-1 tsmes calls are allowed per-module
goog.loadedModules_['only.one.allowed'] = {
  exports: exports.exported,
  type: goog.ModuleType.GOOG,
  moduleId: 'only.one.allowed'
};
/**
 * @return {void}
 */
function f() {
  // tsmes calls must be module-level
  goog.tsMigrationExportsShim('must.be.top.level', {});
}
