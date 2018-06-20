/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire} checked by tsc
 */
/**
 * This test tests importing a type across module boundaries,
 * ensuring that the type gets the proper name in JSDoc comments.
 */
goog.module('test_files.jsdoc_types.jsdoc_types');
var module = module || { id: 'test_files/jsdoc_types/jsdoc_types.ts' };
var module1 = goog.require('test_files.jsdoc_types.module1');
const tsickle_forward_declare_1 = goog.forwardDeclare("test_files.jsdoc_types.module1");
var module2_1 = goog.require('test_files.jsdoc_types.module2');
const tsickle_forward_declare_2 = goog.forwardDeclare("test_files.jsdoc_types.module2");
var default_1 = goog.require('test_files.jsdoc_types.default');
const tsickle_forward_declare_3 = goog.forwardDeclare("test_files.jsdoc_types.default");
const tsickle_forward_declare_4 = goog.forwardDeclare("test_files.jsdoc_types.nevertyped");
goog.require("test_files.jsdoc_types.nevertyped"); // force type-only module to be loaded
/** @type {!tsickle_forward_declare_1.Class} */
let useNamespacedClass = new module1.Class();
/** @type {!tsickle_forward_declare_1.Class} */
let useNamespacedClassAsType;
/** @type {!tsickle_forward_declare_1.Interface} */
let useNamespacedType;
/** @type {!tsickle_forward_declare_2.ClassOne} */
let useLocalClass = new module2_1.ClassOne();
/** @type {!tsickle_forward_declare_2.ClassOne} */
let useLocalClassRenamed = new module2_1.ClassOne();
/** @type {!tsickle_forward_declare_2.ClassTwo} */
let useLocalClassRenamedTwo = new module2_1.ClassTwo();
/** @type {!tsickle_forward_declare_2.ClassOne} */
let useLocalClassAsTypeRenamed;
/** @type {!tsickle_forward_declare_2.Interface} */
let useLocalInterface;
/** @type {!tsickle_forward_declare_2.ClassWithParams<number>} */
let useClassWithParams;
/** @type {number} */
let useLocalValue = module2_1.value;
/** @type {!tsickle_forward_declare_3.default} */
let useDefaultClass = new default_1.default();
/** @type {!tsickle_forward_declare_3.default} */
let useDefaultClassAsType;
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
function ImplementsNeverTyped_tsickle_Closure_declarations() {
    /** @type {number} */
    ImplementsNeverTyped.prototype.foo;
}
/**
 * @template T
 */
class ImplementsNeverTypedTemplated {
}
function ImplementsNeverTypedTemplated_tsickle_Closure_declarations() {
    /** @type {T} */
    ImplementsNeverTypedTemplated.prototype.foo;
}
