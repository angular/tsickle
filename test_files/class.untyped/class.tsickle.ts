interface Interface {
  interfaceFunc(): void;
}
class Super {
/**
 * @return {?}
 */
superFunc(): void {}
}
class Implements implements Interface, Super {
/**
 * @return {?}
 */
interfaceFunc(): void {}
/**
 * @return {?}
 */
superFunc(): void {}
}
class Extends extends Super implements Interface {
/**
 * @return {?}
 */
interfaceFunc(): void {}
}

// Verify Closure accepts the various casts.
let /** @type {?} */ interfaceVar: Interface;
interfaceVar = new Implements();
interfaceVar = new Extends();

let /** @type {?} */ superVar: Super;
superVar = new Implements();
superVar = new Extends();

