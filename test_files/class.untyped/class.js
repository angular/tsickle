/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.class.untyped.class');
var module = module || { id: 'test_files/class.untyped/class.ts' };
module = module;
exports = {};
/**
 * @record
 */
function Interface() { }
if (false) {
    /**
     * @return {?}
     */
    Interface.prototype.interfaceFunc = function () { };
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
/** @typedef {?} */
var TypeAlias;
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
 * @record
 * tsickle: symbol renamed to avoid type/value conflict
 */
function Zone$$TSType() { }
if (false) {
    /** @type {?} */
    Zone$$TSType.prototype.zone;
}
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
/** @typedef {?} */
var ZoneAlias;
class ZoneImplementsAlias {
}
if (false) {
    /** @type {?} */
    ZoneImplementsAlias.prototype.zone;
}
class WithOptionalField {
    constructor() {
        this.optionalField = 'a';
    }
}
if (false) {
    /** @type {?} */
    WithOptionalField.prototype.optionalField;
}
