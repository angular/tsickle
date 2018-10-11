/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
goog.module('test_files.jsdoc_types.jsdoc_types');
var module = module || { id: 'test_files/jsdoc_types/jsdoc_types.ts' };
module = module;
exports = {};
const tsickle_forward_declare_1 = goog.forwardDeclare("test_files.jsdoc_types.default");
const tsickle_forward_declare_2 = goog.forwardDeclare("test_files.jsdoc_types.module1");
const tsickle_forward_declare_3 = goog.forwardDeclare("test_files.jsdoc_types.module2");
/**
 * This test tests importing a type across module boundaries,
 * ensuring that the type gets the proper name in JSDoc comments.
 */
const default_1 = goog.require('test_files.jsdoc_types.default');
const module1 = goog.require('test_files.jsdoc_types.module1');
const module2_1 = goog.require('test_files.jsdoc_types.module2');
// Check that imported types get the proper names in JSDoc.
/** @type {!tsickle_forward_declare_2.Class} */
let useNamespacedClass = new module1.Class();
/** @type {!tsickle_forward_declare_2.Class} */
let useNamespacedClassAsType;
/** @type {!tsickle_forward_declare_2.Interface} */
let useNamespacedType;
// Should be references to the symbols in module2, perhaps via locals.
/** @type {!tsickle_forward_declare_3.ClassOne} */
let useLocalClass = new module2_1.ClassOne();
/** @type {!tsickle_forward_declare_3.ClassOne} */
let useLocalClassRenamed = new module2_1.ClassOne();
/** @type {!tsickle_forward_declare_3.ClassTwo} */
let useLocalClassRenamedTwo = new module2_1.ClassTwo();
/** @type {!tsickle_forward_declare_3.ClassOne} */
let useLocalClassAsTypeRenamed;
/** @type {!tsickle_forward_declare_3.Interface} */
let useLocalInterface;
/** @type {!tsickle_forward_declare_3.ClassWithParams<number>} */
let useClassWithParams;
// This is purely a value; it doesn't need renaming.
/** @type {number} */
let useLocalValue = module2_1.value;
// Check a default import.
/** @type {!tsickle_forward_declare_1.default} */
let useDefaultClass = new default_1.default();
/** @type {!tsickle_forward_declare_1.default} */
let useDefaultClassAsType;
// NeverTyped should be {?}, even in typed mode.
/** @type {?} */
let useNeverTyped;
/** @type {(string|?)} */
let useNeverTyped2;
/** @type {?} */
let useNeverTypedTemplated;
/**
 * Note: no implements JSDoc clause because the type is blacklisted.
 */
class ImplementsNeverTyped {
}
if (false) {
    /** @type {number} */
    ImplementsNeverTyped.prototype.foo;
}
/**
 * @template T
 */
class ImplementsNeverTypedTemplated {
}
if (false) {
    /** @type {T} */
    ImplementsNeverTypedTemplated.prototype.foo;
}
