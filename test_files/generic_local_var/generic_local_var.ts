/**
 * @fileoverview
 * @suppress {uselessCode}
 */

class Container<T> {
  constructor(private tField: T) {}
  method<U>(u: U) {
    const myT: T = this.tField;
    // Closure Compiler previously did not accept local variables using generic
    // types within a generic method's scope. This test now serves as a
    // regression test for the inverse, i.e. that tsickle now emits the type.
    const myU: U = u;
    console.log(myT, myU);
  }
}
