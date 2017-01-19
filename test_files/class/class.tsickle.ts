
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

// Reproduce issue #333: type/value namespace collision.
// Because Zone is both a type and a value, the interface will be dropped
// when converting to Closure, so the "implements" should be ignored.
interface Zone { zone: string; }
const /** @type {function(?): void} */ Zone = (function(global: any) {
class Zone2 implements Zone {
    zone: string;
  }

function Zone2_tsickle_Closure_declarations() {
/** @type {string} */
Zone2.prototype.zone;
}

});
