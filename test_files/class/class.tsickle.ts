
/** @record */
function Interface() {}
/** @type {function(): void} */
Interface.prototype.interfaceFunc;
interface Interface {
  interfaceFunc(): void;
}
class Super {
/**
 * @return {void}
 */
superFunc(): void {}
}
/**
 * @implements {Interface}
 * @extends {Super}
 */
class Implements implements Interface, Super {
/**
 * @return {void}
 */
interfaceFunc(): void {}
/**
 * @return {void}
 */
superFunc(): void {}
}
/**
 * @implements {Interface}
 */
class Extends extends Super implements Interface {
/**
 * @return {void}
 */
interfaceFunc(): void {}
}

// Verify Closure accepts the various casts.
let /** @type {!Interface} */ interfaceVar: Interface;
interfaceVar = new Implements();
interfaceVar = new Extends();

let /** @type {!Super} */ superVar: Super;
superVar = new Implements();
superVar = new Extends();

