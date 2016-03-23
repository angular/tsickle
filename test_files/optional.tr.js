/**
 * @param {number} x
 * @param {string=} y
 */
function optionalArgument(x, y) {
}
optionalArgument(1);
class OptionalTest {
    /**
     * @param {string} a
     * @param {string=} b
     */
    constructor(a, b) {
    }
    /**
     * @param {string=} c
     */
    method(c = 'hi') { }
}
let optionalTest = new OptionalTest('a');
optionalTest.method();
