/**
 * @fileoverview added by tsickle
 * Generated from: test_files/interface/interface_extends.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.interface.interface_extends');
var module = module || { id: 'test_files/interface/interface_extends.ts' };
goog.require('tslib');
/**
 * @record
 */
function ParentInterface() { }
if (false) {
    /** @type {number} */
    ParentInterface.prototype.x;
}
/**
 * @record
 * @extends {ParentInterface}
 */
function SubType() { }
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
if (false) {
    /** @type {number} */
    SubMulti.prototype.z;
}
