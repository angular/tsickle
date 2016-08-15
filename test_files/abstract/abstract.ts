abstract class Base {
  abstract foo(): void;
  bar() { this.foo(); }
}

class Derived extends Base {
  // Workaround for https://github.com/google/closure-compiler/issues/1955
  constructor() {
    super();
  }
  foo() {}
}

let x: Base = new Derived();
