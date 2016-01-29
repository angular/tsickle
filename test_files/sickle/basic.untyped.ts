 /** @return { ?} */// This test is just a random collection of typed code, to
// ensure the output is all with {?} annotations.
function func( /** ? */arg1: string): number[] {
  return [3];
}

class Foo {
  field: string;

  constructor(private ctorArg: string) {

// Sickle: begin stub declarations.

 /** @type { ?} */
this.field;
 /** @type { ?} */
this.ctorArg;
// Sickle: end stub declarations.

    this.field = 'hello';
  }
}
