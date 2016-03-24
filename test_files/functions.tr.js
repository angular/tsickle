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
 * @param {!{a: number, b: number}} param0
 */
function Destructuring({ a, b }) { }
/**
 * @param {!Array<number>} param0
 * @param {!Array<Array<string>>} param1
 */
function Destructuring2([a, b], [[c]]) { }
Destructuring({ a: 1, b: 2 });
Destructuring2([1, 2], [['a']]);
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
