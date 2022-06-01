/**
 *
 * @fileoverview Test file to test that tsickle emits consistent closure types
 * when type args are repeated.
 * Generated from: test_files/type_args_repeated/type_args_repeated.ts
 * @suppress {checkTypes}
 *
 */
goog.module('test_files.type_args_repeated.type_args_repeated');
var module = module || { id: 'test_files/type_args_repeated/type_args_repeated.ts' };
goog.require('tslib');
/**
 * @template S, T, U
 */
class Element {
}
/** @typedef {{value: number, next: ?}} */
var RecursiveType;
// Repeated but non-recursive TS type {} is identified and translated as CLOSURE
// type ALL (*)
// tslint:disable-next-line:no-inferrable-new-expression
/** @type {!Element<{a: number}, *, *>} */
const x = new Element();
/**
 * @param {!Element<{a: number}, *, !Array<?>>} x
 * @return {void}
 */
function foo(x) { }
/**
 * @param {!Element<*, !Array<?>, !Array<?>>} x
 * @return {void}
 */
function bar(x) { }
foo(x);
bar(x);
