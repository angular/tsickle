/**
 * @fileoverview added by tsickle
 * Generated from: test_files/gbigint/exports_gbigint.ts
 */
goog.module('test_files.gbigint.exports_gbigint');
var module = module || { id: 'test_files/gbigint/exports_gbigint.ts' };
goog.require('tslib');
/**
 * @param {string} val
 * @return {!gbigint}
 */
function toGbigint(val) {
    return (/** @type {!gbigint} */ ((/** @type {*} */ (val))));
}
/**
 * A `gbigint` value on an exported variable.
 * @type {!gbigint}
 */
exports.myGbigint = toGbigint('0');
/**
 * A `gbigint` value on a param type.
 * @param {!gbigint} val
 * @return {void}
 */
function takeGbigint(val) {
    console.log(val);
}
exports.takeGbigint = takeGbigint;
