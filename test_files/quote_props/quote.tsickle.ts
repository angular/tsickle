Warning at test_files/quote_props/quote.ts:9:13: Quoted has a string index type but is accessed using dotted access. Quoting the access.
Warning at test_files/quote_props/quote.ts:10:1: Quoted has a string index type but is accessed using dotted access. Quoting the access.
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

console.log(quoted['hello']);
quoted['hello'] = 1;
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


interface QuotedMixed extends Quoted {
  // Assume that foo should be renamed, as it is explicitly declared.
  // It's unclear whether it's the right thing to do, user code might
  // access this field in a mixed fashion.
  foo: number;
  'invalid-identifier': number;
}
let /** @type {!QuotedMixed} */ quotedMixed: QuotedMixed = {foo: 1, 'invalid-identifier': 2};
console.log(quotedMixed.foo);

quotedMixed.foo = 1;
// Should be converted to non-quoted access.
quotedMixed.foo = 1;
// Must not be converted to non-quoted access, as it's not valid JS.
quotedMixed['invalid-identifier'] = 1;
