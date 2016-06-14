goog.module('test_files.jsdoc_types.jsdoc_types');var module = module || {id: 'test_files/jsdoc_types/jsdoc_types.js'};/**
 * This test tests importing a type across module boundaries,
 * ensuring that the type gets the proper name in JSDoc comments.
 */

var module1 = goog.require('test_files.jsdoc_types.module1');
var module2_1 = goog.require('test_files.jsdoc_types.module2');
const ClassOne = module2_1.ClassOne;
var module2_2 = module2_1;
const RenamedClassOne = module2_2.ClassOne;
var module2_3 = module2_1;
const RenamedClassTwo = module2_3.ClassTwo;
var module2_4 = module2_1;
const Interface = module2_4.Interface;
var default_1 = goog.require('test_files.jsdoc_types.default');
const DefaultClass = default_1.default;
// Check that imported types get the proper names in JSDoc.
let /** @type {module1.Class} */ useNamespacedClass = new module1.Class();
let /** @type {module1.Class} */ useNamespacedClassAsType = null;
let /** @type {module1.Interface} */ useNamespacedType = null;
// Should be references to the symbols in module2, perhaps via locals.
let /** @type {ClassOne} */ useLocalClass = new ClassOne();
let /** @type {ClassOne} */ useLocalClassRenamed = new RenamedClassOne();
let /** @type {RenamedClassTwo} */ useLocalClassRenamedTwo = new RenamedClassTwo();
let /** @type {ClassOne} */ useLocalClassAsTypeRenamed = null;
let /** @type {Interface} */ useLocalInterface = null;
// This is purely a value; it doesn't need renaming.
let /** @type {number} */ useLocalValue = module2_1.value;
// Check a default import.
let /** @type {DefaultClass} */ useDefaultClass = new DefaultClass();
let /** @type {DefaultClass} */ useDefaultClassAsType = null;
