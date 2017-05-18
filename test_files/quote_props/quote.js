goog.module('test_files.quote_props.quote');var module = module || {id: 'test_files/quote_props/quote.js'};/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

/**
 * @record
 */
function Quoted() { }
let /** @type {!Quoted} */ quoted = {};
console.log(quoted['hello']);
quoted['hello'] = 1;
quoted['hello'] = 1;
/**
 * @record
 * @extends {Quoted}
 */
function QuotedMixed() { }
/** @type {number} */
QuotedMixed.prototype.foo;
let /** @type {!QuotedMixed} */ quotedMixed = { foo: 1, 'invalid-identifier': 2 };
console.log(quotedMixed.foo);
quotedMixed.foo = 1;
// Should be converted to non-quoted access.
quotedMixed.foo = 1;
// Must not be converted to non-quoted access, as it's not valid JS.
quotedMixed['invalid-identifier'] = 1;
