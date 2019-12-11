export {};

class MyIterable implements IterableIterator<string> {
  [Symbol.iterator](): IterableIterator<string> {
    return this;
  }
  next(...args: []|[string | undefined]): IteratorResult<string, string> {
    return {done: true, value: 'x'};
  }
}
