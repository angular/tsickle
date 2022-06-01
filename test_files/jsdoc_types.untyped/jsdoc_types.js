/**
 * @fileoverview added by tsickle
 * Generated from: test_files/jsdoc_types.untyped/jsdoc_types.ts
 */
/**
 * This test tests importing a type across module boundaries,
 * ensuring that the type gets the proper name in JSDoc comments.
 */
goog.module('test_files.jsdoc_types.untyped.jsdoc_types');
var module = module || { id: 'test_files/jsdoc_types.untyped/jsdoc_types.ts' };
goog.require('tslib');
const module1 = goog.require('test_files.jsdoc_types.untyped.module1');
const module2_1 = goog.require('test_files.jsdoc_types.untyped.module2');
const module2_2 = module2_1;
const module2_3 = module2_1;
const default_1 = goog.require('test_files.jsdoc_types.untyped.default');
// Check that imported types get the proper names in JSDoc.
/** @type {?} */
let useNamespacedClass = new module1.Class();
/** @type {?} */
let useNamespacedClassAsType;
/** @type {?} */
let useNamespacedType;
// Should be references to the symbols in module2, perhaps via locals.
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
// This is purely a value; it doesn't need renaming.
/** @type {?} */
let useLocalValue = module2_1.value;
// Check a default import.
/** @type {?} */
let useDefaultClass = new default_1.default();
/** @type {?} */
let useDefaultClassAsType;
// NeverTyped should be {?}, even in typed mode.
/** @type {?} */
let useNeverTyped;
/** @type {?} */
let useNeverTyped2;
