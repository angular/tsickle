/**
 *
 * @fileoverview Ensure that a type alias declared in a declaration
 * merging namespace is generated as a property of the merged outer class.
 *
 * Generated from: test_files/decl_merge/inner_typedef.ts
 * @suppress {uselessCode,checkTypes}
 *
 */
goog.module('test_files.decl_merge.inner_typedef');
var module = module || { id: 'test_files/decl_merge/inner_typedef.ts' };
goog.require('tslib');
class A {
    /**
     * @public
     * @param {function(string): !A.X} f
     * @return {!A.X}
     */
    foo(f) { return f(''); }
}
exports.A = A;
/** @typedef {function(string): !A.X} */
A.F;
class A$X {
}
/** @const */
A.X = A$X;
/** @type {function(string): !A.X} */
let cb;
