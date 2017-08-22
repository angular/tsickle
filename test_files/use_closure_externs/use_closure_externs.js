goog.module('test_files.use_closure_externs.use_closure_externs');var module = module || {id: 'test_files/use_closure_externs/use_closure_externs.js'};/**
 *
 * @fileoverview A source file that uses types that are used in .d.ts files, but
 * that are not available or use different names in Closure's externs.
 *
 * @suppress {checkTypes} checked by tsc
 */
console.log('work around TS dropping consecutive comments');
let /** @type {!NodeListOf<!HTMLParagraphElement>} */ x = document.getElementsByTagName('p');
console.log(x);
const /** @type {(null|!RegExpExecArray)} */ res = /** @type {!RegExpExecArray} */ ((/asd/.exec('asd asd')));
console.log(res);
let /** @type {!ReadonlyArray<string>} */ a = [''];
let /** @type {!ReadonlyMap<string, string>} */ m = new Map();
let /** @type {!ReadonlySet<string>} */ s = new Set();
