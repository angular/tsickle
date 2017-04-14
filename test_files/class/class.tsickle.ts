Warning at test_files/class/class.ts:125:1: type/symbol conflict for Zone, using {?} for now
====
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes}
 */



/**
 * @record
 */
function Interface() {}
/** @type {function(): void} */
Interface.prototype.interfaceFunc;
// This test exercises the various ways classes and interfaces can interact.
// There are three types of classy things:
//   interface, class, abstract class
// And there are two keywords for relating them:
//   extends, implements
// You can legally use them in almost any configuration the cross product implies;
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
classFunc(): void {}
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
 * @record
 * @extends {Interface}
 */
function InterfaceExtendsInterface() {}
/** @type {function(): void} */
InterfaceExtendsInterface.prototype.interfaceFunc2;


// Write out all permutations:
// 1) interface implements
// 2) interface extends
// 3) class implements
// 4) class extends
// 5) abstract class implements
// 6) abstract class extends

// Permutation 1: interface implements.
// "interface implements" is not legal TypeScript, so no examples necessary.

// Permutation 2: interface extends.
interface InterfaceExtendsInterface extends Interface {
  interfaceFunc2(): void;
}
// Note: interfaces can only extend interfaces, so there's no
// InterfaceExtendsClass etc.
let /** @type {!InterfaceExtendsInterface} */ interfaceExtendsInterface: InterfaceExtendsInterface = {
/**
 * @return {void}
 */
interfaceFunc() {},
/**
 * @return {void}
 */
interfaceFunc2() {}
};
/**
 * @implements {Interface}
 */
class ClassImplementsInterface implements Interface {
/**
 * @return {void}
 */
interfaceFunc(): void {}
}
/**
 * @extends {Class}
 */
class ClassImplementsClass implements Class {
/**
 * @return {void}
 */
classFunc(): void {}
}
/**
 * @extends {AbstractClass}
 */
class ClassImplementsAbstractClass implements AbstractClass {
/**
 * @return {void}
 */
abstractFunc(): void {}
/**
 * @return {void}
 */
nonAbstractFunc(): void {}
}
class ClassExtendsClass extends Class {
/**
 * @return {void}
 */
classFunc(): void {}
}
class ClassExtendsAbstractClass extends AbstractClass {
/**
 * @return {void}
 */
abstractFunc(): void {}
}
/**
 * @abstract
 * @implements {Interface}
 */
abstract class AbstractClassImplementsInterface implements Interface {
/**
 * @return {void}
 */
interfaceFunc(): void {}
}
/**
 * @abstract
 * @extends {Class}
 */
abstract class AbstractClassImplementsClass implements Class {
/**
 * @return {void}
 */
classFunc(): void {}
}
/**
 * @abstract
 * @extends {AbstractClass}
 */
abstract class AbstractClassImplementsAbstractClass implements AbstractClass {
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
 * @abstract
 */
abstract class AbstractClassExtendsClass extends Class {
/**
 * @return {void}
 */
classFunc(): void {}
}
/**
 * @abstract
 */
abstract class AbstractClassExtendsAbstractClass extends AbstractClass {
  // Note: can leave out abstractFunc() because this class is still abstract.
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
classFunc(): void {}
}

// Verify Closure accepts the various subtypes of Interface.
let /** @type {!Interface} */ interfaceVar: Interface;
interfaceVar = interfaceExtendsInterface;
interfaceVar = new ClassImplementsInterface();
interfaceVar = new ImplementsTypeAlias();

// Verify Closure accepts the various subtypes of Class.
let /** @type {!Class} */ classVar: Class;
classVar = new ClassImplementsClass();
classVar = new ClassExtendsClass();
classVar = new ImplementsTypeAlias();

// Verify Closure accepts the various subtypes of AbstractClass.
let /** @type {!AbstractClass} */ abstractClassVar: AbstractClass;
abstractClassVar = new ClassImplementsAbstractClass();
abstractClassVar = new ClassExtendsAbstractClass();

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
