declare module DeclareTestModule {
  export class Foo {
    constructor();
  }
}

declare interface DeclareTestInterface {
  foo: string;
}
/** @record @struct */
function DeclareTestInterface() {}
 /** @export
@type { string} */
DeclareTestInterface.prototype.foo;

