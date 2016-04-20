(function() {
/**
 * @param {?} a
 * @return {?}
 */
function FunctionsTest1(a: number) {
  return a;
}
/**
 * @param {?} a
 * @param {?} b
 * @return {?}
 */
function FunctionsTest2(a: number, b: number) {}
/**
 * @ngInject
 * @param {?} a
 * @param {?} b
 * @return {?}
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
 * @param {?} __0
 * @return {?}
 */
function Destructuring({a, b}: {a: number, b: number}) {}
/**
 * @param {?} __0
 * @param {?} __1
 * @return {?}
 */
function Destructuring2([a, b]: number[], [[c]]: string[][]) {}
/**
 * @param {?} __0
 * @param {?} __1
 * @return {?}
 */
function Destructuring3([a, b], [[c]]) {}
Destructuring({a:1, b:2});
Destructuring2([1, 2], [['a']]);
Destructuring3([1, 2], [['a']]);
/**
 * @param {...?} a
 * @return {?}
 */
function FunctionsTestsSplat(...a: number[]) {}
/**
 * @param {...?} a
 * @return {?}
 */
function FunctionsTestsSplat2(...a: Array<number>) {}
/**
 * @param {...?} a
 * @return {?}
 */
function FunctionsTestsSplat3(...a) {}
FunctionsTestsSplat(1, 2);
FunctionsTestsSplat2(1, 2);
FunctionsTestsSplat3(1, 2);

})();
