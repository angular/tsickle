// test_files/class.untyped/class.ts(48,1): warning TS0: type/symbol conflict for Zone, using {?} for now
/**
 *
 * @fileoverview
 * Generated from: test_files/class.untyped/class.ts
 * @suppress {uselessCode}
 *
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
     * @public
     * @return {?}
     */
    Interface.prototype.interfaceFunc = function () { };
}
class Super {
    /**
     * @public
     * @return {?}
     */
    superFunc() { }
}
class Implements {
    /**
     * @public
     * @return {?}
     */
    interfaceFunc() { }
    /**
     * @public
     * @return {?}
     */
    superFunc() { }
}
class Extends extends Super {
    /**
     * @public
     * @return {?}
     */
    interfaceFunc() { }
}
/** @typedef {?} */
var TypeAlias;
class ImplementsTypeAlias {
    /**
     * @public
     * @return {?}
     */
    interfaceFunc() { }
    /**
     * @public
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
    /**
     * @type {?}
     * @public
     */
    ZoneImplementsInterface.prototype.zone;
}
/** @typedef {?} */
var ZoneAlias;
class ZoneImplementsAlias {
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {?}
     * @public
     */
    ZoneImplementsAlias.prototype.zone;
}
class WithOptionalField {
    constructor() {
        this.optionalField = 'a';
    }
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {?}
     * @public
     */
    WithOptionalField.prototype.optionalField;
}
