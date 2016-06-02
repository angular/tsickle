goog.module('tsickle_test.jsdoc_types.jsdoc_types');/**
 * This test tests importing a type across module boundaries,
 * ensuring that the type gets the proper name in JSDoc comments.
 */

var module1 = goog.require('tsickle_test.jsdoc_types.module1');
var module2_1 = goog.require('tsickle_test.jsdoc_types.module2');
const ClassOne = module2_1.ClassOne;
var module2_2 = module2_1;
const RenamedClassOne = module2_2.ClassOne;
var module2_3 = module2_1;
const RenamedClassTwo = module2_3.ClassTwo;
// Check that imported types get the proper names in JSDoc.
let /** @type {module1.Class} */ x1 = new module1.Class();
let /** @type {module1.Interface} */ x2 = null;
// Should be refer to the names in module2.
let /** @type {ClassOne} */ x3 = new ClassOne();
let /** @type {ClassOne} */ x4 = new RenamedClassOne();
let /** @type {RenamedClassTwo} */ x5 = new RenamedClassTwo();
