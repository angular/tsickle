/**
 *
 * @fileoverview Declares the symbols used in union types in type_alias_exporter. These symbols
 * must ultimately be imported by type_alias_imported.
 *
 * @suppress {checkTypes,extraRequire} checked by tsc
 */
goog.module('test_files.type_alias_imported.type_alias_declare');
var module = module || { id: 'test_files/type_alias_imported/type_alias_declare.ts' };
/**
 * @record
 */
function X() { }
exports.X = X;
function X_tsickle_Closure_declarations() {
    /** @type {string} */
    X.prototype.x;
}
