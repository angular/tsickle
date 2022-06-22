/**
 * @fileoverview This test is just a random collection of typed code, to ensure
 * the output is all with {?} annotations.
 * @suppress {uselessCode}
 */

function func(arg1: string): number[] {
  return [3];
}

class Foo {
  field: string;

  constructor(private ctorArg: string) {
    this.field = 'hello';
  }
}

// These two declarations should not have a @type annotation,
// regardless of untyped.
(function() {
// With a type annotation:
let {a, b}: {a: string, b: number} = {a: '', b: 0};
})();
(function() {
// Without a type annotation:
let {a, b} = {a: null, b: null};
})();
