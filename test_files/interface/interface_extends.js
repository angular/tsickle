/**
 *
 * @fileoverview
 * Generated from: test_files/interface/interface_extends.ts
 * @suppress {uselessCode}
 *
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
