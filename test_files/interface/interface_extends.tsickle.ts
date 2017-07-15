/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */


/**
 * @record
 */
function ParentInterface() {}


function ParentInterface_tsickle_Closure_declarations() {
/** @type {number} */
ParentInterface.prototype.x;
}
interface ParentInterface {
  x: number;
}
/**
 * @record
 * @extends {ParentInterface}
 */
function SubType() {}


function SubType_tsickle_Closure_declarations() {
/** @type {number} */
SubType.prototype.y;
}


interface SubType extends ParentInterface {
  y: number;
}
/**
 * @record
 * @extends {ParentInterface}
 * @extends {SubType}
 */
function SubMulti() {}


function SubMulti_tsickle_Closure_declarations() {
/** @type {number} */
SubMulti.prototype.z;
}


interface SubMulti extends ParentInterface, SubType {
  z: number;
}
