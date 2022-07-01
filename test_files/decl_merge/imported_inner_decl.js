/**
 *
 * @fileoverview Ensure transformed inner classes and enums can be
 * imported and used, and the types are properly annotated in the
 * JS output.
 *
 * Generated from: test_files/decl_merge/imported_inner_decl.ts
 */
goog.module('test_files.decl_merge.imported_inner_decl');
var module = module || { id: 'test_files/decl_merge/imported_inner_decl.ts' };
goog.require('tslib');
const tsickle_inner_class_1 = goog.requireType("test_files.decl_merge.inner_class");
const tsickle_inner_enum_2 = goog.requireType("test_files.decl_merge.inner_enum");
const inner_enum_1 = goog.require('test_files.decl_merge.inner_enum');
/** @type {!tsickle_inner_enum_2.Outer.Event} */
const foo0 = (0, inner_enum_1.e0)();
/**
 * @param {!tsickle_inner_enum_2.Outer.Event} e
 * @return {!tsickle_inner_enum_2.Outer.Event}
 */
function bar(e) {
    return inner_enum_1.Outer.Event.E_1;
}
/** @type {!tsickle_inner_class_1.SomeClass.Inner} */
let inner;
