(function() {
/**
 * @param {?} a
 */
function FunctionsTest1(a: number) {
  return a;
}
/**
 * @param {?} a
 * @param {?} b
 */
function FunctionsTest2(a: number, b: number) {}
/**
 * @ngInject
 * @param {?} a
 * @param {?} b
 */
function FunctionsTest3(a: number, b: number) {}

// Test overloaded functions.
function FunctionsTest4(a: number): string;
/**
 * @param {?} a
 * @return {?}
 */
function FunctionsTest4(a: any): string {
  return "a";
}
/**
 * @param {?} param0
 */
function Destructuring({a, b}: {a: number, b: number}) {}
/**
 * @param {?} param0
 * @param {?} param1
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
 * @param {...?} a
 */
function FunctionsTestsSplat(...a: number[]) {}
/**
 * @param {...?} a
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
