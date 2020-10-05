// test_files/rest_parameters_generic_empty/rest_parameters_generic_empty.ts(3,1): warning TS0: var args type is not an object type
// test_files/rest_parameters_generic_empty/rest_parameters_generic_empty.ts(3,1): warning TS0: var args type is not an object type
/**
 * @fileoverview added by tsickle
 * Generated from: test_files/rest_parameters_generic_empty/rest_parameters_generic_empty.ts
 * @suppress {checkTypes,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.rest_parameters_generic_empty.rest_parameters_generic_empty');
var module = module || { id: 'test_files/rest_parameters_generic_empty/rest_parameters_generic_empty.ts' };
goog.require('tslib');
/**
 * @template A
 * @param {function(!Array<?>): void} fn
 * @return {function(!Array<?>): void}
 */
function returnsRestArgFn(fn) {
    return fn;
}
/** @type {function(): void} */
const zeroRestArguments = returnsRestArgFn((/**
 * @return {void}
 */
() => { }));
console.log(zeroRestArguments);
