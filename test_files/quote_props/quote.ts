// silence warnings about redeclaring vars.
export {};

interface Quoted {
  [k: string]: number;
}
let quoted: Quoted = {};

console.log(quoted.hello);
quoted.hello = 1;
quoted['hello'] = 1;

interface QuotedMixed extends Quoted {
  // Assume that foo should be renamed, as it is explicitly declared.
  // It's unclear whether it's the right thing to do, user code might
  // access this field in a mixed fashion.
  foo: number;
  'invalid-identifier': number;
}
let quotedMixed: QuotedMixed = {foo: 1, 'invalid-identifier': 2};
console.log(quotedMixed.foo);

quotedMixed.foo = 1;
// Should be converted to non-quoted access.
quotedMixed['foo'] = 1;
// Must not be converted to non-quoted access, as it's not valid JS.
quotedMixed['invalid-identifier'] = 1;
