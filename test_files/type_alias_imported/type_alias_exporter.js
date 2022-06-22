/**
 * @fileoverview added by tsickle
 * Generated from: test_files/type_alias_imported/type_alias_exporter.ts
 */
goog.module('test_files.type_alias_imported.type_alias_exporter');
var module = module || { id: 'test_files/type_alias_imported/type_alias_exporter.ts' };
goog.require('tslib');
const tsickle_type_alias_declare_1 = goog.requireType("test_files.type_alias_imported.type_alias_declare");
// Export a type alias that references types from this file that, in turn, are
// not imported at the use site in type_alias_imported. This is a regression
// test for a bug where tsickle would accidentally inline the union type "X|Y"
// instead of emitting the alias "XY" at the use site.
class Y {
}
exports.Y = Y;
/** @typedef {(!tsickle_type_alias_declare_1.X|!Y)} */
exports.XY;
