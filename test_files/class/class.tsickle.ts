Warning at test_files/class/class.ts:74:1: type/symbol conflict for Zone, using {?} for now
====

/** @record */
function Interface() {}
/** @type {function(): void} */
Interface.prototype.interfaceFunc;
// This test exercises the various ways classes and interfaces can interact.
// There are three types of classy things:
//   interface, class, abstract class
// And there are two keywords for relating them:
//   extends, implements
// You can legally use them in any configuration the cross product implies;
// for example, you can "implements" a class though it's more rare than the
// other options.

// Three declarations, one for each type of thing.
interface Interface {
  interfaceFunc(): void;
}
class Class {
/**
 * @return {void}
 */
superFunc(): void {}
}
/**
 * @abstract
 */
abstract class AbstractClass {
/**
 * @abstract
 * @return {void}
 */
abstractFunc() {}
/**
 * @return {void}
 */
nonAbstractFunc(): void { }
}
/**
 * @implements {Interface}
 * @extends {Class}
 */
class Implements implements Interface, Class {
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
 * @extends {AbstractClass}
 */
class ImplementsAbstract implements AbstractClass {
/**
 * @return {void}
 */
abstractFunc(): void {}
/**
 * @return {void}
 */
nonAbstractFunc(): void {}
}
/**
 * @implements {Interface}
 */
class Extends extends Class implements Interface {
/**
 * @return {void}
 */
interfaceFunc(): void {}
}
class ExtendsAbstract extends AbstractClass {
/**
 * @return {void}
 */
abstractFunc(): void {}
}

// It's also legal to alias a type and then implement the alias.
type TypeAlias = Interface;
/** @typedef {!Interface} */
var TypeAlias;

/**
 * @implements {TypeAlias}
 * @extends {Class}
 */
class ImplementsTypeAlias implements TypeAlias, Class {
/**
 * @return {void}
 */
interfaceFunc(): void {}
/**
 * @return {void}
 */
superFunc(): void {}
}

// Verify Closure accepts the various casts.
let /** @type {!Interface} */ interfaceVar: Interface;
interfaceVar = new Implements();
interfaceVar = new Extends();
interfaceVar = new ImplementsTypeAlias();

let /** @type {!Class} */ superVar: Class;
superVar = new Implements();
superVar = new Extends();
superVar = new ImplementsTypeAlias();

// Reproduce issue #333: type/value namespace collision.
// Because Zone is both a type and a value, the interface will be dropped
// when converting to Closure, so the "implements" should be ignored for
// both the direct use and the use via a typedef.
interface Zone { zone: string; }
/**
 * @return {void}
 */
function Zone() {}
class ZoneImplementsInterface implements Zone {
  zone: string;
}

function ZoneImplementsInterface_tsickle_Closure_declarations() {
/** @type {string} */
ZoneImplementsInterface.prototype.zone;
}

type ZoneAlias = Zone;
/** @typedef {?} */
var ZoneAlias;

class ZoneImplementsAlias implements ZoneAlias {
  zone: string;
}

function ZoneImplementsAlias_tsickle_Closure_declarations() {
/** @type {string} */
ZoneImplementsAlias.prototype.zone;
}
