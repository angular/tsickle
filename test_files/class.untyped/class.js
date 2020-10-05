// test_files/class.untyped/class.ts(43,1): warning TS0: type/symbol conflict for Zone, using {?} for now
/**
 * @fileoverview added by tsickle
 * Generated from: test_files/class.untyped/class.ts
 * @suppress {checkTypes,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.class.untyped.class');
var module = module || { id: 'test_files/class.untyped/class.ts' };
goog.require('tslib');
/**
 * @record
 */
function Interface() { }
/* istanbul ignore if */
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
// WARNING: interface has both a type and a value, skipping emit
/**
 * @return {?}
 */
function Zone() { }
class ZoneImplementsInterface {
}
/* istanbul ignore if */
if (false) {
    /** @type {?} */
    ZoneImplementsInterface.prototype.zone;
}
/** @typedef {?} */
var ZoneAlias;
class ZoneImplementsAlias {
}
/* istanbul ignore if */
if (false) {
    /** @type {?} */
    ZoneImplementsAlias.prototype.zone;
}
class WithOptionalField {
    constructor() {
        this.optionalField = 'a';
    }
}
/* istanbul ignore if */
if (false) {
    /** @type {?} */
    WithOptionalField.prototype.optionalField;
}
