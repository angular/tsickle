/**
 * @fileoverview added by tsickle
 * Generated from: test_files/optional/optional.ts
 */
goog.module('test_files.optional.optional');
var module = module || { id: 'test_files/optional/optional.ts' };
goog.require('tslib');
/**
 * @param {number} x
 * @param {(undefined|string)=} y
 * @return {void}
 */
function optionalArgument(x, y) {
}
optionalArgument(1);
class OptionalTest {
    /**
     * @public
     * @param {string} a
     * @param {(undefined|string)=} b
     */
    constructor(a, b) { }
    /**
     * @public
     * @param {string=} c
     * @return {void}
     */
    method(c = 'hi') { }
}
/** @type {!OptionalTest} */
let optionalTest = new OptionalTest('a');
optionalTest.method();
