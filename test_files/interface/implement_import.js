/**
 *
 * @fileoverview
 * Generated from: test_files/interface/implement_import.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.interface.implement_import');
var module = module || { id: 'test_files/interface/implement_import.ts' };
goog.require('tslib');
const tsickle_interface_1 = goog.requireType("test_files.interface.interface");
const interface_1 = goog.require('test_files.interface.interface');
/**
 * @implements {tsickle_interface_1.Point}
 */
class MyPoint {
    /**
     * @public
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {number}
     * @public
     */
    MyPoint.prototype.x;
    /**
     * @type {number}
     * @public
     */
    MyPoint.prototype.y;
}
/**
 * @extends {tsickle_interface_1.User}
 */
class ImplementsUser {
    /**
     * @public
     * @param {number} shoeSize
     */
    constructor(shoeSize) {
        this.shoeSize = shoeSize;
    }
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {number}
     * @public
     */
    ImplementsUser.prototype.shoeSize;
}
// Note that the @extends JSDoc points to a different name than the extends
// clause. Closure Compiler allows this as long as they both eventually resolve
// to the same type.
/**
 * @extends {tsickle_interface_1.User}
 */
class ExtendsUser extends interface_1.User {
    /**
     * @public
     */
    constructor() {
        super();
    }
}
