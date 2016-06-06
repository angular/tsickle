goog.module('test_files.jsdoc_types.untyped.jsdoc_types');var module = {id: 'test_files/jsdoc_types.untyped/jsdoc_types.js'};/**
 * This test tests importing a type across module boundaries,
 * ensuring that the type gets the proper name in JSDoc comments.
 */

var module1 = goog.require('test_files.jsdoc_types.untyped.module1');
var module2_1 = goog.require('test_files.jsdoc_types.untyped.module2');
var module2_2 = module2_1;
var module2_3 = module2_1;
// Check that imported types get the proper names in JSDoc.
let /** @type {?} */ x1 = new module1.Class();
let /** @type {?} */ x2 = null;
// Should be refer to the names in module2.
let /** @type {?} */ x3 = new module2_1.ClassOne();
let /** @type {?} */ x4 = new module2_2.ClassOne();
let /** @type {?} */ x5 = new module2_3.ClassTwo();
