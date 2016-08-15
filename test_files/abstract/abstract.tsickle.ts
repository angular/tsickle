abstract class Base {
/**
 * @abstract
 * @return {void}
 */
abstract foo(): void{}
/**
 * @return {void}
 */
bar() { this.foo(); }
}

class Derived extends Base {
/**
 */
constructor() {
    super();
  }
/**
 * @return {void}
 */
foo() {}
}

let /** @type {Base} */ x: Base = new Derived();
