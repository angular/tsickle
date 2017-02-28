goog.module('test_files.class.class');var module = module || {id: 'test_files/class/class.js'};/** @record */
function Interface() { }
/** @type {function(): void} */
Interface.prototype.interfaceFunc;
class Class {
    /**
     * @return {void}
     */
    classFunc() { }
}
/**
 * @abstract
 */
class AbstractClass {
    /**
     * @abstract
     * @return {void}
     */
    abstractFunc() { }
    /**
     * @return {void}
     */
    nonAbstractFunc() { }
}
/** @record */
function InterfaceExtendsInterface() { }
// TODO: derived interfaces.
/** @type {function(): void} */
InterfaceExtendsInterface.prototype.interfaceFunc2;
/** @record */
function InterfaceExtendsClass() { }
// TODO: derived interfaces.
/** @type {function(): void} */
InterfaceExtendsClass.prototype.interfaceFunc2;
/** @record */
function InterfaceExtendsAbstractClass() { }
// TODO: derived interfaces.
/** @type {function(): void} */
InterfaceExtendsAbstractClass.prototype.interfaceFunc2;
/**
 * @implements {Interface}
 */
class ClassImplementsInterface {
    /**
     * @return {void}
     */
    interfaceFunc() { }
}
/**
 * @extends {Class}
 */
class ClassImplementsClass {
    /**
     * @return {void}
     */
    classFunc() { }
}
/**
 * @extends {AbstractClass}
 */
class ClassImplementsAbstractClass {
    /**
     * @return {void}
     */
    abstractFunc() { }
    /**
     * @return {void}
     */
    nonAbstractFunc() { }
}
class ClassExtendsClass extends Class {
    /**
     * @return {void}
     */
    classFunc() { }
}
class ClassExtendsAbstractClass extends AbstractClass {
    /**
     * @return {void}
     */
    abstractFunc() { }
}
/** @typedef {!Interface} */
var TypeAlias;
/**
 * @implements {TypeAlias}
 * @extends {Class}
 */
class ImplementsTypeAlias {
    /**
     * @return {void}
     */
    interfaceFunc() { }
    /**
     * @return {void}
     */
    classFunc() { }
}
// Verify Closure accepts the various subtypes of Interface.
let /** @type {!Interface} */ interfaceVar;
let /** @type {!InterfaceExtendsInterface} */ interfaceExtendsInterface = (null);
interfaceVar = interfaceExtendsInterface;
interfaceVar = new ClassImplementsInterface();
interfaceVar = new ImplementsTypeAlias();
// Verify Closure accepts the various subtypes of Class.
let /** @type {!Class} */ classVar;
let /** @type {!InterfaceExtendsClass} */ interfaceExtendsClass = (null);
classVar = interfaceExtendsClass;
classVar = new ClassImplementsClass();
classVar = new ClassExtendsClass();
classVar = new ImplementsTypeAlias();
// Verify Closure accepts the various subtypes of AbstractClass.
let /** @type {!AbstractClass} */ abstractClassVar;
let /** @type {!InterfaceExtendsAbstractClass} */ interfaceExtendsAbstractClass = (null);
abstractClassVar = interfaceExtendsAbstractClass;
abstractClassVar = new ClassImplementsAbstractClass();
abstractClassVar = new ClassExtendsAbstractClass();
/**
 * @return {void}
 */
function Zone() { }
class ZoneImplementsInterface {
}
function ZoneImplementsInterface_tsickle_Closure_declarations() {
    /** @type {string} */
    ZoneImplementsInterface.prototype.zone;
}
/** @typedef {?} */
var ZoneAlias;
class ZoneImplementsAlias {
}
function ZoneImplementsAlias_tsickle_Closure_declarations() {
    /** @type {string} */
    ZoneImplementsAlias.prototype.zone;
}
