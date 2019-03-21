interface Foobar<T> {
  flat<U>(this: U[][][], depth: 2): U[];
  flat<U>(this: U[][], depth?: 1): U[];
  flat<U>(this: U[], depth: 0): U[];
  /** @param depth The maximum recursion depth */
  flat<U>(depth?: number): any[];
}
