/**
 * @fileoverview Test to ensure that there is only one record declaration
 * for a merged interface.
 * @suppress {uselessCode}
 */

interface Foo {
  bar(): string;
}

// This declaration will be merged with then one above and it must not generate
// a second record declaration.
interface Foo {
  baz(): number;
}

class Foolish implements Foo {
  bar() {
    return 'bar';
  }
  baz() {
    return 0;
  }
}

function A() {
  interface I {}
  let i: I = {};
}

function B() {
  // This declaration is different from the one in function A. It must generate
  // its own record declaration.
  interface I {}
  let i: I = {};
}
