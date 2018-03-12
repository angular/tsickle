/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
goog.module('test_files.interface.implement_import');var module = module || {id: 'test_files/interface/implement_import.js'};
var interface_1 = goog.require('test_files.interface.interface');
const tsickle_forward_declare_1 = goog.forwardDeclare("test_files.interface.interface");
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
/** @type {number} */
MyPoint.prototype.x;
/** @type {number} */
MyPoint.prototype.y;
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
/** @type {number} */
ImplementsUser.prototype.shoeSize;
class ExtendsUser extends interface_1.User {
    constructor() {
        super();
    }
}
