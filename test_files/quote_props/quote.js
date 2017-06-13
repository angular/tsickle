goog.module('test_files.quote_props.quote');var module = module || {id: 'test_files/quote_props/quote.js'};/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

/**
 * @record
 */
function Quoted() { }
let /** @type {!Quoted} */ quoted = {};
console.log(quoted["hello"]);
quoted["hello"] = 1;
quoted['hello'] = 1;
/**
 * @record
 * @extends {Quoted}
 */
function QuotedMixed() { }
/** @type {number} */
QuotedMixed.prototype.foo;
/* TODO: handle strange member:
'invalid-identifier': number;
*/
/** @type {number} */
QuotedMixed.prototype.quotedIdent;
let /** @type {!QuotedMixed} */ quotedMixed = { foo: 1, 'invalid-identifier': 2, 'quotedIdent': 3 };
console.log(quotedMixed.foo);
quotedMixed.foo = 1;
// Intentionally kept as a quoted access, but gives a warning.
quotedMixed['foo'] = 1;
// Must not be converted to non-quoted access, as it's not valid JS.
// Does not give a warning.
quotedMixed['invalid-identifier'] = 1;
// Must not be converted to non-quoted access because it was declared quoted.
quotedMixed['quotedIdent'] = 1;
// any does not declare any symbols.
let /** @type {?} */ anyTyped;
console.log(anyTyped['token']);
