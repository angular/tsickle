
/**
 * @param { ?} arg1
 * @return { ?}
 */
function func(arg1: string): number[] {
  return [3];
}

class Foo {
  field: string;

  constructor(private ctorArg: string) {
    this.field = 'hello';

// Sickle: begin stub declarations.

 /** @type { ?} */
this.field;
 /** @type { ?} */
this.ctorArg;
// Sickle: end stub declarations.

  }
}
