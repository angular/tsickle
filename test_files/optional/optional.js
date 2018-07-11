/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
goog.module('test_files.optional.optional');
var module = module || { id: 'test_files/optional/optional.ts' };
module = module;
exports = {};
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
     * @param {string} a
     * @param {(undefined|string)=} b
     */
    constructor(a, b) { }
    /**
     * @param {string=} c
     * @return {void}
     */
    method(c = 'hi') { }
}
/** @type {!OptionalTest} */
let optionalTest = new OptionalTest('a');
optionalTest.method();
