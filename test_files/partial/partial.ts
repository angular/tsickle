/**
 * @fileoverview
 * @suppress {uselessCode}
 */

export {};

interface Base {
  foo: string;
}

class Derived implements Partial<Base> {
  foo: string|undefined;
  useFoo() {
    this.foo = undefined;
  }
}
