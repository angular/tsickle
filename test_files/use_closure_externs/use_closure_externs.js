/**
 *
 * @fileoverview A source file that uses types that are used in .d.ts files, but
 * that are not available or use different names in Closure's externs.
 * Generated from: test_files/use_closure_externs/use_closure_externs.ts
 * @suppress {checkTypes}
 *
 */
goog.module('test_files.use_closure_externs.use_closure_externs');
var module = module || { id: 'test_files/use_closure_externs/use_closure_externs.ts' };
goog.require('tslib');
/** @type {!NodeListOf<!HTMLElement>} */
let x = document.getElementsByName('p');
console.log(x);
/** @type {(null|!RegExpExecArray)} */
const res = (/** @type {!RegExpExecArray} */ (/asd/.exec('asd asd')));
console.log(res);
/** @type {!ReadonlyArray<string>} */
let a = [''];
/** @type {!ReadonlyMap<string, string>} */
let m = new Map();
/** @type {!ReadonlySet<string>} */
let s = new Set();
