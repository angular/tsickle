goog.module('test_files.type_alias_imported.type_alias_default_exporter');var module = module || {id: 'test_files/type_alias_imported/type_alias_default_exporter.js'};/**
 *
 * @fileoverview Declares a type alias as default export. This allows testing that the appropriate
 * type reference is created (no .default property).
 *
 * @suppress {checkTypes} checked by tsc
 */

const tsickle_forward_declare_1 = goog.forwardDeclare("test_files.type_alias_imported.type_alias_declare");
class Z {
}
exports.Z = Z;
/** @typedef {(!tsickle_forward_declare_1.X|!Z)} */
var DefaultExport;
