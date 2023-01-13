// test_files/type_intersection/intersection.ts(17,1): warning TS0: unhandled type flags: Intersection
// test_files/type_intersection/intersection.ts(19,1): warning TS0: unhandled type flags: Intersection
// test_files/type_intersection/intersection.ts(19,1): warning TS0: unhandled type flags: Intersection
/**
 *
 * @fileoverview Test that type alias declarations containing an intersection
 * of type literals does not lose property names in the externs. Regression
 * test for b/261049209.
 * Generated from: test_files/type_intersection/intersection.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.type_intersection.intersection');
var module = module || { id: 'test_files/type_intersection/intersection.ts' };
goog.require('tslib');
/** @typedef {{x: number}} */
var A;
/** @typedef {!test_files$type_intersection$intersection.B} */
exports.B;
/** @typedef {!test_files$type_intersection$intersection.C} */
exports.C;
