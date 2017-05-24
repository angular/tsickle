Warning at test_files/quote_props/quote.ts:9:13: Quoted has a string index type but is accessed using dotted access. Quoting the access.
Warning at test_files/quote_props/quote.ts:10:1: Quoted has a string index type but is accessed using dotted access. Quoting the access.
Warning at test_files/quote_props/quote.ts:27:1: Declared property foo accessed with quotes. This can lead to renaming bugs. A better fix is to use 'declare interface' on the declaration.
====
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

// silence warnings about redeclaring vars.
export {};
/**
 * @record
 */
function Quoted() {}
/* TODO: handle strange member:
[k: string]: number;
*/


interface Quoted {
  [k: string]: number;
}
let /** @type {!Quoted} */ quoted: Quoted = {};

console.log(quoted["hello"]);
quoted["hello"] = 1;
quoted['hello'] = 1;
/**
 * @record
 * @extends {Quoted}
 */
function QuotedMixed() {}
/** @type {number} */
QuotedMixed.prototype.foo;
/* TODO: handle strange member:
'invalid-identifier': number;
*/
/** @type {number} */
QuotedMixed.prototype.quotedIdent;


interface QuotedMixed extends Quoted {
  // Even though foo is explicitly declared as a property, assume it should not
  // be renamed.
  // It's unclear whether it's the right thing to do, user code might
  // access this field in a mixed fashion.
  foo: number;
  'invalid-identifier': number;
  'quotedIdent': number;
}
let /** @type {!QuotedMixed} */ quotedMixed: QuotedMixed = {foo: 1, 'invalid-identifier': 2, 'quotedIdent': 3};
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
let /** @type {?} */ anyTyped: any;
console.log(anyTyped['token']);
