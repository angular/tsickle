/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
goog.module('test_files.class.untyped.class');
var module = module || { id: 'test_files/class.untyped/class.ts' };
/**
 * @record
 */
function Interface() { }
/** @type {?} */
Interface.prototype.interfaceFunc;
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
/** @type {?} */
let interfaceVar;
interfaceVar = new Implements();
interfaceVar = new Extends();
interfaceVar = new ImplementsTypeAlias();
/** @type {?} */
let superVar;
superVar = new Implements();
superVar = new Extends();
superVar = new ImplementsTypeAlias();
/**
 * @return {?}
 */
function Zone() { }
class ZoneImplementsInterface {
}
if (false) {
    /** @type {?} */
    ZoneImplementsInterface.prototype.zone;
}
class ZoneImplementsAlias {
}
if (false) {
    /** @type {?} */
    ZoneImplementsAlias.prototype.zone;
}
