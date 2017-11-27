goog.module('test_files.typedef_generic.typedef_generic');var module = module || {id: 'test_files/typedef_generic/typedef_generic.js'};/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/** @typedef {(string|number)} */
var UnionTypeAlias;
/**
 * @record
 * @template T, U
 */
function TypeWithGenericArgAndDefault() { }
function TypeWithGenericArgAndDefault_tsickle_Closure_declarations() {
}
/** @typedef {!TypeWithGenericArgAndDefault<number, UnionTypeAlias>} */
var TypeAliasWithDefaultArgs;
/**
 * @record
 * @template T
 */
function TypeWithGenericArg() { }
function TypeWithGenericArg_tsickle_Closure_declarations() {
}
/** @typedef {!TypeWithGenericArg<?>} */
var TypeAliasWithTypeArgs;
// Repro to ensure we pass on the syntactical type node (TypeAliasWithTypeArgs)
// through a two-level generic type argument.
const /** @type {!Array<!TypeAliasWithTypeArgs<string>>} */ varUsingArrayOfGenericAlias = [];
