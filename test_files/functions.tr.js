/**
 * @param {number} a
 * @return {string}
 */
function FunctionsTest1(a) {
    return "a";
}
/**
 * @param {number} a
 * @param {number} b
 */
function FunctionsTest2(a, b) { }
/**
 * @ngInject
 * @param {number} a
 * @param {number} b
 */
function FunctionsTest3(a, b) { }
/**
 * @param {{a: number, b: number}} param0
 */
function Destructuring({ a, b }) { }
/**
 * @param {...number} a
 */
function FunctionsTestsSplat(...a) { }
/**
 * @param {...number} a
 */
function FunctionsTestsSplat2(...a) { }
/**
 * @param a
 */
function FunctionsTestsSplat3(...a) { }
FunctionsTestsSplat(1, 2);
FunctionsTestsSplat2(1, 2);
FunctionsTestsSplat3(1, 2);
