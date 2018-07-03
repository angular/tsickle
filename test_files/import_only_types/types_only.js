/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
// Exports only types, but must still be goog.require'd for Closure Compiler.
goog.module('test_files.import_only_types.types_only');
var module = module || { id: 'test_files/import_only_types/types_only.ts' };
/**
 * @record
 */
function Foo() { }
exports.Foo = Foo;
/** @type {string} */
Foo.prototype.x;
/** @typedef {number} */
var Bar_tsickle_typedef_1;
exports.Bar = Bar_tsickle_typedef_1;
/** @typedef {function(): void} */
var FnType_tsickle_typedef_2;
exports.FnType = FnType_tsickle_typedef_2;
/**
 * Uses exported types to demonstrate that the symbols can be resolved locally.
 * @param {!Foo} a
 * @param {FnType_tsickle_typedef_2} b
 * @return {void}
 */
function doThing(a, b) { }
