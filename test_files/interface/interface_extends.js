/**
 * @fileoverview added by tsickle
 * Generated from: test_files/interface/interface_extends.ts
 * @suppress {checkTypes,const,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
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
    /**
     * @type {number}
     * @public
     */
    ParentInterface.prototype.x;
}
/**
 * @record
 * @extends {ParentInterface}
 */
function SubType() { }
/* istanbul ignore if */
if (false) {
    /**
     * @type {number}
     * @public
     */
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
    /**
     * @type {number}
     * @public
     */
    SubMulti.prototype.z;
}
