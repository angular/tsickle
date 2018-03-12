/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
goog.module('test_files.class.untyped.class');var module = module || {id: 'test_files/class.untyped/class.js'};/**
 * @record
 */
function Interface() { }
function Interface_tsickle_Closure_declarations() {
    /** @type {?} */
    Interface.prototype.interfaceFunc;
}
class Super {
    /**
     * @return {?}
     */
    superFunc() { }
}
class Implements {
    /**
     * @return {?}
     */
    interfaceFunc() { }
    /**
     * @return {?}
     */
    superFunc() { }
}
class Extends extends Super {
    /**
     * @return {?}
     */
    interfaceFunc() { }
}
class ImplementsTypeAlias {
    /**
     * @return {?}
     */
    interfaceFunc() { }
    /**
     * @return {?}
     */
    superFunc() { }
}
// Verify Closure accepts the various casts.
let /** @type {?} */ interfaceVar;
interfaceVar = new Implements();
interfaceVar = new Extends();
interfaceVar = new ImplementsTypeAlias();
let /** @type {?} */ superVar;
superVar = new Implements();
superVar = new Extends();
superVar = new ImplementsTypeAlias();
/**
 * @return {?}
 */
function Zone() { }
class ZoneImplementsInterface {
}
/** @type {?} */
ZoneImplementsInterface.prototype.zone;
class ZoneImplementsAlias {
}
/** @type {?} */
ZoneImplementsAlias.prototype.zone;
