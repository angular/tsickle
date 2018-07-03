/**
 *
 * @fileoverview Declares a type alias as default export. This allows testing that the appropriate
 * type reference is created (no .default property).
 *
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
goog.module('test_files.type_alias_imported.type_alias_default_exporter');
var module = module || { id: 'test_files/type_alias_imported/type_alias_default_exporter.ts' };
const tsickle_forward_declare_1 = goog.forwardDeclare("test_files.type_alias_imported.type_alias_declare");
goog.require("test_files.type_alias_imported.type_alias_declare"); // force type-only module to be loaded
class Z {
}
exports.Z = Z;
/** @typedef {(!tsickle_forward_declare_1.X|!Z)} */
var DefaultExport_tsickle_typedef_1;
