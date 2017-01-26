goog.module('test_files.class.class');var module = module || {id: 'test_files/class/class.js'};/** @record */
function Interface() { }
/** @type {function(): void} */
Interface.prototype.interfaceFunc;
class Super {
    /**
     * @return {void}
     */
    superFunc() { }
}
/**
 * @implements {Interface}
 * @extends {Super}
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
 * @implements {Interface}
 */
class Extends extends Super {
    /**
     * @return {void}
     */
    interfaceFunc() { }
}
/** @typedef {!Interface} */
var TypeAlias;
/**
 * @implements {TypeAlias}
 * @extends {Super}
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
let /** @type {!Super} */ superVar;
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
class HasObjectliteral {
    constructor() {
        this.foo = {
            bar: 0,
            baz: ''
        };
    }
}
function HasObjectliteral_tsickle_Closure_declarations() {
    /** @type {{bar: number, baz: string}} */
    HasObjectliteral.prototype.foo;
}
