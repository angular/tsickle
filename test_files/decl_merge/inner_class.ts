/**
 * @fileoverview Ensure inner classes defined with declaration merging
 *   are properly transformed and hoisted out of the namespace, and
 *   no iife is created for the namespace.
 *
 * @suppress {uselessCode,checkTypes}
 */

export class SomeClass {
  foolMeOnce(i: SomeClass.Inner) {
    return null;
  }
}

// tslint:disable-next-line:no-namespace
export namespace SomeClass {
  export class Inner {}
  export class Another extends Inner {
    foolMeTwice(i: Inner) {
      return null;
    }
  }
}

let some: SomeClass.Inner;


// Check that all unqualified references to symbols in X automatically
// get qualified with the namespace name X.

class X {
  bar(b: X.E) {
    return b === X.E.A ? X.E.B : null;
  }
}

// tslint:disable-next-line:no-namespace
namespace X {
  export enum E {A, B}
  export class Y {
    a = E.A;
    b: E = E.B;
    y = new Y();
    foo(e: E|string) {
      return E.B;
    }
    bar<W extends E>(x: X) {
      type T = (a: E) => E;
      type S = typeof E;
      const U = typeof E;
      const V = E;
      return x.bar(E.A);
    }
    baz() {
      return new Y()
    }
  }
  export class Z extends Y {}
}