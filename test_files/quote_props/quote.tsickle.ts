Warning at test_files/quote_props/quote.ts:9:13: Quoted has a string index type but is accessed using dotted access. Quoting the access.
Warning at test_files/quote_props/quote.ts:10:1: Quoted has a string index type but is accessed using dotted access. Quoting the access.
====
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


interface QuotedMixed extends Quoted {
  // Assume that foo should be renamed, as it is explicitly declared.
  // It's unclear whether it's the right thing to do, user code might
  // access this field in a mixed fashion.
  foo: number;
}
let /** @type {!QuotedMixed} */ quotedMixed: QuotedMixed = {foo: 1};
console.log(quotedMixed.foo);

quotedMixed.foo = 1;
// Should be converted to non-quoted access.
quotedMixed.foo = 1;
