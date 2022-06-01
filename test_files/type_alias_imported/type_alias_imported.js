/**
 * @fileoverview Make sure imports are inserted *after* the fileoverview.
 * Generated from: test_files/type_alias_imported/type_alias_imported.ts
 */
goog.module('test_files.type_alias_imported.type_alias_imported');
var module = module || { id: 'test_files/type_alias_imported/type_alias_imported.ts' };
goog.require('tslib');
const tsickle_export_constant_1 = goog.requireType("test_files.type_alias_imported.export_constant");
const tsickle_type_alias_exporter_2 = goog.requireType("test_files.type_alias_imported.type_alias_exporter");
const tsickle_type_alias_default_exporter_3 = goog.requireType("test_files.type_alias_imported.type_alias_default_exporter");
const tsickle_type_alias_declare_4 = goog.requireType("test_files.type_alias_imported.type_alias_declare");
const export_constant_1 = goog.require('test_files.type_alias_imported.export_constant');
// The union types below use members from the exporting files that are not
// explicitly imported into this file. tsickle must emit extra forwardDeclare
// statements for them.
/** @type {(!tsickle_type_alias_declare_4.X|!tsickle_type_alias_exporter_2.Y)} */
let usingTypeAlias;
/** @type {(boolean|!tsickle_type_alias_declare_4.X|!tsickle_type_alias_exporter_2.Y)} */
let usingTypeAliasInUnion;
/** @type {(boolean|!tsickle_type_alias_declare_4.X|!tsickle_type_alias_default_exporter_3.Z)} */
let usingDefaultExportAlias;
// The code below reproduces an issue where tsickle would break source maps if it just post-hoc
// prepended imports to its emit, which in turn would break the references to imported symbols, as
// tsc would no longer understand these symbols are imported and need to be prefixed with the module
// type.
console.log(export_constant_1.SOME_CONSTANT);
