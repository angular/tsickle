Warning at test_files/functions/functions.ts:20:1: unhandled type {type flags:0x2000 Tuple features:ObjectType,StructuredType}
Warning at test_files/functions/functions.ts:20:1: unhandled type {type flags:0x2000 Tuple features:ObjectType,StructuredType}
====
(function() {
/**
 * @param {number} a
 * @return {number}
 */
function FunctionsTest1(a: number) {
  return a;
}
/**
 * @param {number} a
 * @param {number} b
 * @return {void}
 */
function FunctionsTest2(a: number, b: number) {}
/**
 * @ngInject
 * @param {number} a
 * @param {number} b
 * @return {void}
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
 * @param {!{a: number, b: number}} __0
 * @return {void}
 */
function Destructuring({a, b}: {a: number, b: number}) {}
/**
 * @param {!Array<number>} __0
 * @param {!Array<!Array<string>>} __1
 * @return {void}
 */
function Destructuring2([a, b]: number[], [[c]]: string[][]) {}
/**
 * @param {?} __0
 * @param {?} __1
 * @return {void}
 */
function Destructuring3([a, b], [[c]]) {}
Destructuring({a:1, b:2});
Destructuring2([1, 2], [['a']]);
Destructuring3([1, 2], [['a']]);
/**
 * @param {...number} a
 * @return {void}
 */
function FunctionsTestsSplat(...a: number[]) {}
/**
 * @param {...number} a
 * @return {void}
 */
function FunctionsTestsSplat2(...a: Array<number>) {}
/**
 * @param {...?} a
 * @return {void}
 */
function FunctionsTestsSplat3(...a) {}
FunctionsTestsSplat(1, 2);
FunctionsTestsSplat2(1, 2);
FunctionsTestsSplat3(1, 2);

})();
