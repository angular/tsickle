/**
 * @fileoverview Reproduces an error that caused incorrect Automatic Semicolon Insertion.
 * Generated from: test_files/arrow_fn.es5/arrow_fn_es5.ts
 */
goog.module('test_files.arrow_fn.es5.arrow_fn_es5');
var module = module || { id: 'test_files/arrow_fn.es5/arrow_fn_es5.ts' };
goog.require('tslib');
/** @type {function(): void} */
var foo = (/**
 * @return {void}
 */
function () {
    // this comment must not get inserted between the return and expression in ES5 (ASI).
    return console.log('foo');
});
/** @type {function(): void} */
var bar = (/**
 * @return {void}
 */
function () {
    console.log('bar');
});
