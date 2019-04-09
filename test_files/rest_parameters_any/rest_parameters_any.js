// test_files/rest_parameters_any/rest_parameters_any.ts(26,7): warning TS0: var args type is not an object type
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
// This test covers the rest parameter of function
// and method signatures. This includes signatures
// only consisting of a rest parameter and
// signatures mixing both explicit declarations
// and a rest parameter.
goog.module('test_files.rest_parameters_any.rest_parameters_any');
var module = module || { id: 'test_files/rest_parameters_any/rest_parameters_any.ts' };
module = module;
exports = {};
/**
 * @record
 */
function CallbackMaps() { }
/** @type {!CallbackMaps} */
const p = {
    // should annotate a as {?} and b as {?}
    /**
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
/** @type {function(number, !Array<?>): number} */
const test = (/**
 * @param {number} a
 * @param {?} b
 * @return {?}
 */
(a, b) => {
    // allowed as b is implicitly declared as `any`
    return a + b;
});
