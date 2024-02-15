/**
 * @fileoverview Ensure that a function declared in a declaration
 * merging namespace is generated as a property of the merged outer enum.
 *
 * Generated from: test_files/decl_merge/outer_enum.ts
 * @suppress {uselessCode,checkTypes}
 */
goog.module('test_files.decl_merge.outer_enum');
var module = module || { id: 'test_files/decl_merge/outer_enum.ts' };
goog.require('tslib');
/** @enum {number} */
const E = {
    a: 42,
    b: 43,
};
exports.E = E;
E[E.a] = 'a';
E[E.b] = 'b';
/**
 * @param {string} s
 * @return {!E}
 */
function E$fromString(s) {
    return s === 'a' ? E.a : E.b;
}
/** @const */
E.fromString = E$fromString;
/** @type {!E} */
const e = E.fromString('a');
