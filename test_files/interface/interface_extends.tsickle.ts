/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes}
 */



/**
 * @record
 */
function ParentInterface() {}
/** @type {number} */
ParentInterface.prototype.x;
interface ParentInterface {
  x: number;
}
/**
 * @record
 * @extends {ParentInterface}
 */
function SubType() {}
/** @type {number} */
SubType.prototype.y;


interface SubType extends ParentInterface {
  y: number;
}
/**
 * @record
 * @extends {ParentInterface}
 * @extends {SubType}
 */
function SubMulti() {}
/** @type {number} */
SubMulti.prototype.z;


interface SubMulti extends ParentInterface, SubType {
  z: number;
}
