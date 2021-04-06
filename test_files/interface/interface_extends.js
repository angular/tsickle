// test_files/interface/interface_extends.ts(17,1): warning TS0: dropped extends: anonymous type
/**
 * @fileoverview added by tsickle
 * Generated from: test_files/interface/interface_extends.ts
 * @suppress {checkTypes,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.interface.interface_extends');
var module = module || { id: 'test_files/interface/interface_extends.ts' };
goog.require('tslib');
/**
 * @record
 */
function ParentInterface() { }
/* istanbul ignore if */
if (false) {
    /** @type {number} */
    ParentInterface.prototype.x;
}
/**
 * @record
 * @extends {ParentInterface}
 */
function SubType() { }
/* istanbul ignore if */
if (false) {
    /** @type {number} */
    SubType.prototype.y;
}
/**
 * @record
 * @extends {ParentInterface}
 * @extends {SubType}
 */
function SubMulti() { }
/* istanbul ignore if */
if (false) {
    /** @type {number} */
    SubMulti.prototype.z;
}
/** @typedef {{aFunction: function(): void}} */
var ANamespace;
/**
 * @record
 * tsickle: dropped extends: anonymous type
 */
function InterfaceExtendsNamespace() { }
