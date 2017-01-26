Warning at test_files/class/class.ts:46:1: type/symbol conflict for Zone, using {?} for now
====

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

// It's also legal to alias a type and then implement the alias.
type TypeAlias = Interface;
/** @typedef {!Interface} */
var TypeAlias;

/**
 * @implements {TypeAlias}
 * @extends {Super}
 */
class ImplementsTypeAlias implements TypeAlias, Super {
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

let /** @type {!Super} */ superVar: Super;
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

class HasObjectliteral {
public foo = {
    bar: 0,
    baz: ''
  };
}

function HasObjectliteral_tsickle_Closure_declarations() {
/** @type {{bar: number, baz: string}} */
HasObjectliteral.prototype.foo;
}
