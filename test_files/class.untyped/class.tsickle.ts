/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */


/**
 * @record
 */
function Interface() {}


function Interface_tsickle_Closure_declarations() {
/** @type {?} */
Interface.prototype.interfaceFunc;
}
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

// It's also legal to alias a type and then implement the alias.
type TypeAlias = Interface;
class ImplementsTypeAlias implements TypeAlias, Super {
/**
 * @return {?}
 */
interfaceFunc(): void {}
/**
 * @return {?}
 */
superFunc(): void {}
}

// Verify Closure accepts the various casts.
let /** @type {?} */ interfaceVar: Interface;
interfaceVar = new Implements();
interfaceVar = new Extends();
interfaceVar = new ImplementsTypeAlias();

let /** @type {?} */ superVar: Super;
superVar = new Implements();
superVar = new Extends();
superVar = new ImplementsTypeAlias();

// Reproduce issue #333: type/value namespace collision.
// Because Zone is both a type and a value, the interface will be dropped
// when converting to Closure, so the "implements" should be ignored for
// both the direct use and the use via a typedef.
interface Zone { zone: string; }
/**
 * @return {?}
 */
function Zone() {}
class ZoneImplementsInterface implements Zone {
  zone: string;
}

function ZoneImplementsInterface_tsickle_Closure_declarations() {
/** @type {?} */
ZoneImplementsInterface.prototype.zone;
}

type ZoneAlias = Zone;
class ZoneImplementsAlias implements ZoneAlias {
  zone: string;
}

function ZoneImplementsAlias_tsickle_Closure_declarations() {
/** @type {?} */
ZoneImplementsAlias.prototype.zone;
}
