/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes}
 */



/**
 * @param {number} a
 * @return {number}
 */
function Test1(a: number) {
  return a;
}
/**
 * @param {number} a
 * @param {number} b
 * @return {void}
 */
function Test2(a: number, b: number) {}
/**
 * @ngInject
 * @param {number} a
 * @param {number} b
 * @return {void}
 */
function Test3(a: number, b: number) {}

// Test overloaded functions.
function Test4(a: number): string;
/**
 * @param {?} a
 * @return {string}
 */
function Test4(a: any): string {
  return 'a';
}
/**
 * @this {string}
 * @param {...?} params
 * @return {void}
 */
function TestThisAndRest(this: string, ...params: any[]) {}
TestThisAndRest.call('foo', 'bar', 3);
/**
 * @param {{a: number, b: number}} __0
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
 * @param {!Array<?>} __0
 * @param {!Array<?>} __1
 * @return {void}
 */
function Destructuring3([a, b], [[c]]) {}
Destructuring({a: 1, b: 2});
Destructuring2([1, 2], [['a']]);
Destructuring3([1, 2], [['a']]);
/**
 * @param {...number} a
 * @return {void}
 */
function TestSplat(...a: number[]) {}
/**
 * @param {...number} a
 * @return {void}
 */
function TestSplat2(...a: Array<number>) {}
/**
 * @param {...?} a
 * @return {void}
 */
function TestSplat3(...a) {}
TestSplat(1, 2);
TestSplat2(1, 2);
TestSplat3(1, 2);
/**
 * @param {number=} x
 * @param {number=} y
 * @param {...?} z
 * @return {void}
 */
function defaultBeforeRequired(x = 1, y: number, ...z: any[]) {}
defaultBeforeRequired(undefined, 2, 'h', 3);
