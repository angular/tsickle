/**
 * @fileoverview Tests that tuple types get emitted with local aliases to
 * attach Closure types to.
 */

const m = new Map<string, number>([['1', 1], ['2', 2]]);
for (const [s, n] of m) {
  console.error(s, n);
}

function localTuple(xs: [string, [number, number]]) {
  const [s, [n1, n2]] = xs;
  console.error(s, n1, n2);
  const [, [, elision]] = xs;
  console.error(elision);
}

function unsupportedObjectDestructuring(xs: [string, {a: string}]) {
  const [s, {a}] = xs;
  console.error(s, a);

  const {destructured3, destructured4}:
      {destructured3: number,
       destructured4: number} = {destructured3: 3, destructured4: 4};
  console.error(destructured3, destructured4);
}

function letDestructuring(xs: [string, number]) {
  let [a, b] = xs;
  a = 'changed';
  console.error(a, b);
}

const tupleTyped: [number, string] = [1, 'a'];
const tupleTypedHomogeneous: [number, number] = [1, 1];
const emptyTupleType: [] = [];
console.error(tupleTyped, tupleTypedHomogeneous, emptyTupleType);
