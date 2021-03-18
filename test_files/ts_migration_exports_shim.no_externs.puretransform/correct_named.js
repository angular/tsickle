goog.module('test_files.ts_migration_exports_shim.no_externs.puretransform.correct_named');
var module = module || {
  id: 'test_files/ts_migration_exports_shim.no_externs.puretransform/correct_named.ts'
};
goog.require('tslib');
/** An example export to be re-exported. */
class MyNamedClass {
  constructor() {
    this.field = 1;
  }
}
exports.MyNamedClass = MyNamedClass;
goog.loadedModules_['project.named'] = {
  exports: {MyRenamedClass: MyNamedClass},
  type: goog.ModuleType.GOOG,
  moduleId: 'project.named'
};
