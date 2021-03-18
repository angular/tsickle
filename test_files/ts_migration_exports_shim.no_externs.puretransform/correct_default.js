goog.module('test_files.ts_migration_exports_shim.no_externs.puretransform.correct_default');
var module = module || {
  id: 'test_files/ts_migration_exports_shim.no_externs.puretransform/correct_default.ts'
};
goog.require('tslib');
/** An example export to be re-exported. */
class MyDefaultClass {
  constructor() {
    this.field = 1;
  }
}
exports.MyDefaultClass = MyDefaultClass;
goog.loadedModules_['project.MyDefaultClass'] = {
  exports: MyDefaultClass,
  type: goog.ModuleType.GOOG,
  moduleId: 'project.MyDefaultClass'
};
