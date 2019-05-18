export {};

function returnsRestArgFn<A extends unknown[]>(fn: (...args: A) => void):
    (...args: A) => void {
  return fn;
}

const zeroRestArguments = returnsRestArgFn(() => {});
console.log(zeroRestArguments);
