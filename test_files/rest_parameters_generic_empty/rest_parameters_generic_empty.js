// test_files/rest_parameters_generic_empty/rest_parameters_generic_empty.ts(13,7): warning TS0: unable to translate rest args type
/**
 *
 * @fileoverview Tests what happens when a rest args (...x) param is
 * instantiated in a context where it creates a zero-argument function.
 *
 * Generated from: test_files/rest_parameters_generic_empty/rest_parameters_generic_empty.ts
 */
goog.module('test_files.rest_parameters_generic_empty.rest_parameters_generic_empty');
var module = module || { id: 'test_files/rest_parameters_generic_empty/rest_parameters_generic_empty.ts' };
goog.require('tslib');
/**
 * @template A
 * @param {function(...*): void} fn
 * @return {function(...*): void}
 */
function returnsRestArgFn(fn) {
    return fn;
}
/** @type {function(...?): void} */
const zeroRestArguments = returnsRestArgFn((/**
 * @return {void}
 */
() => { }));
console.log(zeroRestArguments);
