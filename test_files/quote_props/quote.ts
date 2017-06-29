// silence warnings about redeclaring vars.
export {};

interface Quoted {
  [k: string]: number;
}
let quoted: Quoted = {};

console.log(quoted.hello);
quoted.hello = 1;
quoted['hello'] = 1;
/** some comment */
quoted.hello = 1;

interface QuotedMixed extends Quoted {
  // Even though foo is explicitly declared as a property, assume it should not
  // be renamed.
  // It's unclear whether it's the right thing to do, user code might
  // access this field in a mixed fashion.
  foo: number;
  'invalid-identifier': number;
  'quotedIdent': number;
}
let quotedMixed: QuotedMixed = {foo: 1, 'invalid-identifier': 2, 'quotedIdent': 3};
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
let anyTyped: any;
console.log(anyTyped['token']);
