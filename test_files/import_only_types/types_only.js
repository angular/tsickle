/**
 *
 * @fileoverview Exports only types, but must still be goog.require'd for
 * Closure Compiler.
 * Generated from: test_files/import_only_types/types_only.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.import_only_types.types_only');
var module = module || { id: 'test_files/import_only_types/types_only.ts' };
goog.require('tslib');
/**
 * @record
 */
function Foo() { }
exports.Foo = Foo;
/* istanbul ignore if */
if (false) {
    /**
     * @type {string}
     * @public
     */
    Foo.prototype.x;
}
/** @typedef {number} */
exports.Bar;
/**
 * A type that will be used within this file below.
 * @typedef {function(): void}
 */
exports.FnType;
/**
 * Uses exported types to demonstrate that the symbols can be resolved locally.
 * @param {!Foo} a
 * @param {function(): void} b
 * @return {void}
 */
function doThing(a, b) { }
