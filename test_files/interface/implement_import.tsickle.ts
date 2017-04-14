/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes}
 */


import {Point, User} from './interface';
const tsickle_forward_declare_1 = goog.forwardDeclare('test_files.interface.interface');
/**
 * @implements {tsickle_forward_declare_1.Point}
 */
class MyPoint implements Point {
/**
 * @param {number} x
 * @param {number} y
 */
constructor(public x: number,
public y: number) {}
}

function MyPoint_tsickle_Closure_declarations() {
/** @type {number} */
MyPoint.prototype.x;
/** @type {number} */
MyPoint.prototype.y;
}

/**
 * @extends {tsickle_forward_declare_1.User}
 */
class ImplementsUser implements User {
/**
 * @param {number} shoeSize
 */
constructor(public shoeSize: number) {}
}

function ImplementsUser_tsickle_Closure_declarations() {
/** @type {number} */
ImplementsUser.prototype.shoeSize;
}

class ExtendsUser extends User {
constructor() {
    super();
  }
}
