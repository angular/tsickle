goog.module('tsickle_test.jsdoc_types.jsdoc_types');/**
 * This test tests importing a type across module boundaries,
 * ensuring that the type gets the proper name in JSDoc comments.
 */

var module1 = goog.require('tsickle_test.jsdoc_types.module1');
// Check that imported types get the proper names in JSDoc.
let /** @type {module1.Class} */ x1 = new module1.Class();
