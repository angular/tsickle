goog.module('test_files.class.class');var module = module || {id: 'test_files/class/class.js'};/** @record */
function Interface() { }
/** @type {function(): void} */
Interface.prototype.interfaceFunc;
class Class {
    /**
     * @return {void}
     */
    superFunc() { }
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
/**
 * @implements {Interface}
 * @extends {Class}
 */
class Implements {
    /**
     * @return {void}
     */
    interfaceFunc() { }
    /**
     * @return {void}
     */
    superFunc() { }
}
/**
 * @extends {AbstractClass}
 */
class ImplementsAbstract {
    /**
     * @return {void}
     */
    abstractFunc() { }
    /**
     * @return {void}
     */
    nonAbstractFunc() { }
}
/**
 * @implements {Interface}
 */
class Extends extends Class {
    /**
     * @return {void}
     */
    interfaceFunc() { }
}
class ExtendsAbstract extends AbstractClass {
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
    superFunc() { }
}
// Verify Closure accepts the various casts.
let /** @type {!Interface} */ interfaceVar;
interfaceVar = new Implements();
interfaceVar = new Extends();
interfaceVar = new ImplementsTypeAlias();
let /** @type {!Class} */ superVar;
superVar = new Implements();
superVar = new Extends();
superVar = new ImplementsTypeAlias();
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
