/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
goog.module('test_files.interface.interface_extends');
var module = module || { id: 'test_files/interface/interface_extends.ts' };
module = module;
exports = {};
/**
 * @record
 */
function ParentInterface() { }
/** @type {number} */
ParentInterface.prototype.x;
/**
 * @record
 * @extends {ParentInterface}
 */
function SubType() { }
/** @type {number} */
SubType.prototype.y;
/**
 * @record
 * @extends {ParentInterface}
 * @extends {SubType}
 */
function SubMulti() { }
/** @type {number} */
SubMulti.prototype.z;
