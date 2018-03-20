/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
goog.module('test_files.jsdoc_types.untyped.jsdoc_types');var module = module || {id: 'test_files/jsdoc_types.untyped/jsdoc_types.js'};/**
 * This test tests importing a type across module boundaries,
 * ensuring that the type gets the proper name in JSDoc comments.
 */

var module1 = goog.require('test_files.jsdoc_types.untyped.module1');
var module2_1 = goog.require('test_files.jsdoc_types.untyped.module2');
var module2_2 = module2_1;
var module2_3 = module2_1;
var default_1 = goog.require('test_files.jsdoc_types.untyped.default');
// Check that imported types get the proper names in JSDoc.
let useNamespacedClass = new module1.Class();
let useNamespacedClassAsType;
let useNamespacedType;
// Should be references to the symbols in module2, perhaps via locals.
let useLocalClass = new module2_1.ClassOne();
let useLocalClassRenamed = new module2_2.ClassOne();
let useLocalClassRenamedTwo = new module2_3.ClassTwo();
let useLocalClassAsTypeRenamed;
let useLocalInterface;
let useClassWithParams;
// This is purely a value; it doesn't need renaming.
let useLocalValue = module2_1.value;
// Check a default import.
let useDefaultClass = new default_1.default();
let useDefaultClassAsType;
// NeverTyped should be {?}, even in typed mode.
let useNeverTyped;
let useNeverTyped2;
