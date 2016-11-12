goog.module('test_files.optional.optional');var module = module || {id: 'test_files/optional/optional.js'};/**
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
    constructor(a, b) {
    }
    /**
     * @param {string=} c
     * @return {void}
     */
    method(c = 'hi') { }
}
let /** @type {!OptionalTest} */ optionalTest = new OptionalTest('a');
optionalTest.method();
