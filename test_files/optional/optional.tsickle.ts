/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes}
 */



/**
 * @param {number} x
 * @param {(undefined|string)=} y
 * @return {void}
 */
function optionalArgument(x: number, y?: string) {
}
optionalArgument(1);
class OptionalTest {
/**
 * @param {string} a
 * @param {(undefined|string)=} b
 */
constructor(a: string, b?: string) {}
/**
 * @param {string=} c
 * @return {void}
 */
method(c: string = 'hi') {}
}

let /** @type {!OptionalTest} */ optionalTest = new OptionalTest('a');
optionalTest.method();
