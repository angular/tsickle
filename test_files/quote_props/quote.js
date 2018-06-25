// test_files/quote_props/quote.ts(9,13): warning TS0: Quoted has a string index type but is accessed using dotted access. Quoting the access.
// test_files/quote_props/quote.ts(10,1): warning TS0: Quoted has a string index type but is accessed using dotted access. Quoting the access.
// test_files/quote_props/quote.ts(13,1): warning TS0: Quoted has a string index type but is accessed using dotted access. Quoting the access.
// test_files/quote_props/quote.ts(29,1): warning TS0: Declared property foo accessed with quotes. This can lead to renaming bugs. A better fix is to use 'declare interface' on the declaration.
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
goog.module('test_files.quote_props.quote');
var module = module || { id: 'test_files/quote_props/quote.ts' };
/**
 * @record
 */
function Quoted() { }
/** @type {!Quoted} */
let quoted = {};
console.log(quoted["hello"]);
quoted["hello"] = 1;
quoted['hello'] = 1;
/** some comment */
quoted["hello"] = 1;
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
/** @type {!QuotedMixed} */
let quotedMixed = { foo: 1, 'invalid-identifier': 2, 'quotedIdent': 3 };
console.log(quotedMixed.foo);
quotedMixed.foo = 1;
// Intentionally kept as a quoted access, but gives a warning.
quotedMixed['foo'] = 1;
// Must not be converted to non-quoted access, as it's not valid JS.
// Does not give a warning.
quotedMixed['invalid-identifier'] = 1;
// Must not be converted to non-quoted access because it was declared quoted.
quotedMixed['quotedIdent'] = 1;
/** @type {?} */
let anyTyped;
console.log(anyTyped['token']);
