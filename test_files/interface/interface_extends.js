/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire} checked by tsc
 */
goog.module('test_files.interface.interface_extends');
var module = module || { id: 'test_files/interface/interface_extends.ts' };
/**
 * @record
 */
function ParentInterface() { }
function ParentInterface_tsickle_Closure_declarations() {
    /** @type {number} */
    ParentInterface.prototype.x;
}
/**
 * @record
 * @extends {ParentInterface}
 */
function SubType() { }
function SubType_tsickle_Closure_declarations() {
    /** @type {number} */
    SubType.prototype.y;
}
/**
 * @record
 * @extends {ParentInterface}
 * @extends {SubType}
 */
function SubMulti() { }
function SubMulti_tsickle_Closure_declarations() {
    /** @type {number} */
    SubMulti.prototype.z;
}
