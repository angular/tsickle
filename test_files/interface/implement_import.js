goog.module('test_files.interface.implement_import');var module = module || {id: 'test_files/interface/implement_import.js'};/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes}
 */

var interface_1 = goog.require('test_files.interface.interface');
const tsickle_forward_declare_1 = goog.forwardDeclare('test_files.interface.interface');
/**
 * @implements {tsickle_forward_declare_1.Point}
 */
class MyPoint {
    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
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
class ImplementsUser {
    /**
     * @param {number} shoeSize
     */
    constructor(shoeSize) {
        this.shoeSize = shoeSize;
    }
}
function ImplementsUser_tsickle_Closure_declarations() {
    /** @type {number} */
    ImplementsUser.prototype.shoeSize;
}
class ExtendsUser extends interface_1.User {
    constructor() {
        super();
    }
}
