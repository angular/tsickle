(function() {
/**
 * @param {number} a
 */
function FunctionsTest1(a: number) {
  return a;
}
/**
 * @param {number} a
 * @param {number} b
 */
function FunctionsTest2(a: number, b: number) {}
/**
 * @ngInject
 * @param {number} a
 * @param {number} b
 */
function FunctionsTest3(a: number, b: number) {}

// Test overloaded functions.
function FunctionsTest4(a: number): string;
/**
 * @param {?} a
 * @return {string}
 */
function FunctionsTest4(a: any): string {
  return "a";
}
/**
 * @param {!{a: number, b: number}} param0
 */
function Destructuring({a, b}: {a: number, b: number}) {}
/**
 * @param {!Array<number>} param0
 * @param {!Array<!Array<string>>} param1
 */
function Destructuring2([a, b]: number[], [[c]]: string[][]) {}
/**
 * @param param0
 * @param param1
 */
function Destructuring3([a, b], [[c]]) {}
Destructuring({a:1, b:2});
Destructuring2([1, 2], [['a']]);
Destructuring3([1, 2], [['a']]);
/**
 * @param {...number} a
 */
function FunctionsTestsSplat(...a: number[]) {}
/**
 * @param {...number} a
 */
function FunctionsTestsSplat2(...a: Array<number>) {}
/**
 * @param a
 */
function FunctionsTestsSplat3(...a) {}
FunctionsTestsSplat(1, 2);
FunctionsTestsSplat2(1, 2);
FunctionsTestsSplat3(1, 2);

})();
