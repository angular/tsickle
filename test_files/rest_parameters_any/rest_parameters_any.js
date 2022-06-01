// test_files/rest_parameters_any/rest_parameters_any.ts(26,7): warning TS0: unable to translate rest args type
/**
 *
 * @fileoverview This test covers the rest parameter of function and method
 * signatures. This includes signatures only consisting of a rest parameter and
 * signatures mixing both explicit declarations and a rest parameter.
 *
 * Generated from: test_files/rest_parameters_any/rest_parameters_any.ts
 */
goog.module('test_files.rest_parameters_any.rest_parameters_any');
var module = module || { id: 'test_files/rest_parameters_any/rest_parameters_any.ts' };
goog.require('tslib');
/**
 * @record
 */
function CallbackMaps() { }
/** @type {!CallbackMaps} */
const p = {
    // should annotate a as {?} and b as {?}
    /**
     * @public
     * @param {?} a
     * @param {?} b
     * @return {!Array<?>}
     */
    foo(a, b) {
        return [a, b];
    },
    // should annotate a as {number} and b as {?}
    123: (/**
     * @param {number} a
     * @param {?} b
     * @return {!Array<?>}
     */
    (a, b) => ([a, b])),
};
// should annotate a as number and b as {?}
/** @type {function(number, ...?): number} */
const test = (/**
 * @param {number} a
 * @param {?} b
 * @return {?}
 */
(a, b) => {
    // allowed as b is implicitly declared as `any`
    return a + b;
});
