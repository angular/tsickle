
/**
 * @param {number} x
 * @param {string=} y
 */
function optionalArgument(x: number, y?: string) {
}
optionalArgument(1);

class OptionalTest {
/**
 * @param {string} a
 * @param {string=} b
 */
constructor(a: string, b?: string) {}
/**
 * @param {string=} c
 */
method(c: string = 'hi') {}
}

let optionalTest = new OptionalTest('a');
optionalTest.method();
