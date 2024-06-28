/**
 * @fileoverview Checks that spread operator in type literals is
 *   handled correctly.
 *   Test cases adapted from b/333548529.
 *
 * @suppress {checkTypes}
 */

function randBool() {
  return Math.random() < 0.5;
}

function spread1() {
  return {...(randBool() && {bar: 'baz'})};
}

const result1 = spread1();

function spread2() {
  return {foo: 1, ...(randBool() && {bar: 'baz'})};
}

const result2 = spread2();

function optional1() {
  return {bar: randBool() ? 'baz' : undefined};
}

function optional2() {
  const ret: {bar?: string} = {};
  if (randBool()) ret.bar = 'baz';
  return ret;
}
