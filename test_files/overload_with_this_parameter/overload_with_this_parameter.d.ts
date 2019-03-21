interface Foo<T> {
  // Not all signatures have a this parameter.
  bar<U>(this: U[], x: 1): U[];
  bar<U>(x?: number): any[];
}
