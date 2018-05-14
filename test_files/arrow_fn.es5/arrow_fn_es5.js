/**
 * @fileoverview Reproduces an error that caused incorrect Automatic Semicolon Insertion.
 * @suppress {checkTypes,extraRequire} checked by tsc
 */
goog.module('test_files.arrow_fn.es5.arrow_fn_es5');
var module = module || { id: 'test_files/arrow_fn.es5/arrow_fn_es5.ts' };
var /** @type {function(): void} */ foo = function () {
    // this comment must not get inserted between the return and expression in ES5 (ASI).
    return console.log('foo');
};
var /** @type {function(): void} */ bar = function () {
    console.log('bar');
};
