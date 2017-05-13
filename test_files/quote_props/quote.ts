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
}
// TODO(martinprobst): should 'foo: 1' below be quoted?
let quotedMixed: QuotedMixed = {foo: 1};
console.log(quotedMixed.foo);

// TODO(martinprobst): should this access to a declared property be quoted?
quotedMixed.foo = 1;
// TODO(martinprobst): should this access to a declared property be un-quoted?
quotedMixed['foo'] = 1;
