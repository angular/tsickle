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

// Reproduce issue #333: type/value namespace collision.
// Because Zone is both a type and a value, the interface will be dropped
// when converting to Closure, so the "implements" should be ignored.
interface Zone { zone: string; }
const /** @type {?} */ Zone = (function(global: any) {
class Zone2 implements Zone {
    zone: string;
  }

function Zone2_tsickle_Closure_declarations() {
/** @type {?} */
Zone2.prototype.zone;
}

});
