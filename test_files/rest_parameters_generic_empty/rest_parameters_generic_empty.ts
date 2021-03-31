/**
 * @fileoverview Tests what happens when a rest args (...x) param is
 * instantiated in a context where it creates a zero-argument function.
 */

export {};

function returnsRestArgFn<A extends unknown[]>(fn: (...args: A) => void):
    (...args: A) => void {
  return fn;
}

const zeroRestArguments = returnsRestArgFn(() => {});
console.log(zeroRestArguments);
