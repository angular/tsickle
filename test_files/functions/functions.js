// test_files/functions/functions.ts(38,20): warning TS0: failed to resolve rest parameter type, emitting ?
/**
 *
 * @fileoverview
 * Generated from: test_files/functions/functions.ts
 * @suppress {checkTypes}
 *
 */
goog.module('test_files.functions.functions');
var module = module || { id: 'test_files/functions/functions.ts' };
goog.require('tslib');
/**
 * @param {number} a
 * @return {number}
 */
function Test1(a) {
    return a;
}
/**
 * @param {number} a
 * @param {number} b
 * @return {void}
 */
function Test2(a, b) { }
/**
 * @ngInject
 * @param {number} a
 * @param {number} b
 * @return {void}
 */
function Test3(a, b) { }
/**
 * @param {?} a
 * @return {string}
 */
function Test4(a) {
    return 'a';
}
// Test a "this" param and a rest param in the same function.
/**
 * @this {string}
 * @param {...?} params
 * @return {void}
 */
function TestThisAndRest(...params) { }
TestThisAndRest.call('foo', 'bar', 3);
/**
 * @param {{a: number, b: number}} __0
 * @return {void}
 */
function Destructuring({ a, b }) { }
/**
 * @param {!Array<number>} __0
 * @param {!Array<!Array<string>>} __1
 * @return {void}
 */
function Destructuring2([a__tsickle_destructured_1, b__tsickle_destructured_2], [[c__tsickle_destructured_3]]) { let a = /** @type {number} */ (a__tsickle_destructured_1); let b = /** @type {number} */ (b__tsickle_destructured_2); let c = /** @type {string} */ (c__tsickle_destructured_3); }
/**
 * @param {!Array<?>} __0
 * @param {!Array<?>} __1
 * @return {void}
 */
function Destructuring3([a__tsickle_destructured_4, b__tsickle_destructured_5], [[c__tsickle_destructured_6]]) { let a = /** @type {?} */ (a__tsickle_destructured_4); let b = /** @type {?} */ (b__tsickle_destructured_5); let c = /** @type {?} */ (c__tsickle_destructured_6); }
Destructuring({ a: 1, b: 2 });
Destructuring2([1, 2], [['a']]);
Destructuring3([1, 2], [['a']]);
/**
 * @param {...number} a
 * @return {void}
 */
function testRest(...a) { }
/**
 * @param {...number} a
 * @return {void}
 */
function testRest2(...a) { }
/**
 * @param {...?} a
 * @return {void}
 */
function testRest3(...a) { }
/**
 * @template T
 * @param {...number} a
 * @return {void}
 */
function testRest4(...a) { }
/**
 * @template T
 * @param {function(...number): void} f
 * @return {void}
 */
function testRest5(f) { }
/**
 * @param {...number} a
 * @return {void}
 */
function testRest6(...a) { }
/**
 * @param {...?} a
 * @return {void}
 */
function testRest7(...a) { }
testRest(1, 2);
testRest2(1, 2);
testRest3(1, 2);
testRest4(1, 2);
testRest5((/**
 * @param {number} x
 * @param {number} y
 * @return {void}
 */
(x, y) => { }));
testRest6(1, 2);
testRest7(1, 'a');
/**
 * @param {number=} x
 * @param {number=} y
 * @param {...?} z
 * @return {void}
 */
function defaultBeforeRequired(x = 1, y, ...z) { }
defaultBeforeRequired(undefined, 2, 'h', 3);
// The array reference below happens on the template parameter constraint, not
// on the parameter itself. Make sure tsickle unwraps the right type.
/**
 * @template T
 * @param {...string} str
 * @return {number}
 */
function templatedBoundRestArg(...str) {
    return str.length;
}
// But only do so if the parameter is not an array reference type by itself.
/**
 * @template T
 * @param {...T} str
 * @return {number}
 */
function templatedBoundRestArg2(...str) {
    return str.length;
}
// Also handle the case where it's both.
/**
 * @template T
 * @param {...T} str
 * @return {number}
 */
function templatedBoundRestArg3(...str) {
    return str.length;
}
/**
 * @template T
 * @param {T} t
 * @return {number}
 */
function templated(t) {
    return 1;
}
