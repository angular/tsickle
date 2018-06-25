/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * This test tests importing a type across module boundaries,
 * ensuring that the type gets the proper name in JSDoc comments.
 */
goog.module('test_files.jsdoc_types.untyped.jsdoc_types');
var module = module || { id: 'test_files/jsdoc_types.untyped/jsdoc_types.ts' };
var module1 = goog.require('test_files.jsdoc_types.untyped.module1');
var module2_1 = goog.require('test_files.jsdoc_types.untyped.module2');
var module2_2 = module2_1;
var module2_3 = module2_1;
var default_1 = goog.require('test_files.jsdoc_types.untyped.default');
/** @type {?} */
let useNamespacedClass = new module1.Class();
/** @type {?} */
let useNamespacedClassAsType;
/** @type {?} */
let useNamespacedType;
/** @type {?} */
let useLocalClass = new module2_1.ClassOne();
/** @type {?} */
let useLocalClassRenamed = new module2_2.ClassOne();
/** @type {?} */
let useLocalClassRenamedTwo = new module2_3.ClassTwo();
/** @type {?} */
let useLocalClassAsTypeRenamed;
/** @type {?} */
let useLocalInterface;
/** @type {?} */
let useClassWithParams;
/** @type {?} */
let useLocalValue = module2_1.value;
/** @type {?} */
let useDefaultClass = new default_1.default();
/** @type {?} */
let useDefaultClassAsType;
/** @type {?} */
let useNeverTyped;
/** @type {?} */
let useNeverTyped2;
