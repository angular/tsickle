/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.functions.functions');
var module = module || { id: 'test_files/functions/functions.ts' };
module = module;
exports = {};
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
function Destructuring2([a, b], [[c]]) { }
/**
 * @param {!Array<?>} __0
 * @param {!Array<?>} __1
 * @return {void}
 */
function Destructuring3([a, b], [[c]]) { }
Destructuring({ a: 1, b: 2 });
Destructuring2([1, 2], [['a']]);
Destructuring3([1, 2], [['a']]);
/**
 * @param {...number} a
 * @return {void}
 */
function TestSplat(...a) { }
/**
 * @param {...number} a
 * @return {void}
 */
function TestSplat2(...a) { }
/**
 * @param {...?} a
 * @return {void}
 */
function TestSplat3(...a) { }
TestSplat(1, 2);
TestSplat2(1, 2);
TestSplat3(1, 2);
/**
 * @param {number=} x
 * @param {number=} y
 * @param {...?} z
 * @return {void}
 */
function defaultBeforeRequired(x = 1, y, ...z) { }
defaultBeforeRequired(undefined, 2, 'h', 3);
// The array reference below happens on the template parameter constraint, not on the parameter
// itself. Make sure tsickle unwraps the right type.
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
