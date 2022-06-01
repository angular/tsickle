/**
 *
 * @fileoverview Declares a type alias as default export. This allows testing that the appropriate
 * type reference is created (no .default property).
 *
 * Generated from: test_files/type_alias_imported/type_alias_default_exporter.ts
 */
goog.module('test_files.type_alias_imported.type_alias_default_exporter');
var module = module || { id: 'test_files/type_alias_imported/type_alias_default_exporter.ts' };
goog.require('tslib');
const tsickle_type_alias_declare_1 = goog.requireType("test_files.type_alias_imported.type_alias_declare");
class Z {
}
exports.Z = Z;
/** @typedef {(!tsickle_type_alias_declare_1.X|!Z)} */
var DefaultExport;
