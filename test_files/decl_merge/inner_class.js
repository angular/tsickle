/**
 *
 * @fileoverview Ensure inner classes defined with declaration merging
 *   are properly transformed and hoisted out of the namespace, and
 *   no iife is created for the namespace.
 *
 * Generated from: test_files/decl_merge/inner_class.ts
 */
goog.module('test_files.decl_merge.inner_class');
var module = module || { id: 'test_files/decl_merge/inner_class.ts' };
goog.require('tslib');
class SomeClass {
}
exports.SomeClass = SomeClass;
class SomeClass$Inner {
}
/** @const */
SomeClass.Inner = SomeClass$Inner;
/**
 * @extends {SomeClass.Inner}
 */
class SomeClass$Another extends SomeClass.Inner {
}
/** @const */
SomeClass.Another = SomeClass$Another;
/** @type {!SomeClass.Inner} */
let x;
