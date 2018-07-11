/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
goog.module('test_files.abstract.abstract');
var module = module || { id: 'test_files/abstract/abstract.ts' };
module = module;
exports = {};
/**
 * @abstract
 */
class Base {
    /**
     * @return {void}
     */
    bar() {
        this.simple();
        this.publicAbstract();
        this.params([]);
        this.noReturnType();
        this.hasReturnType();
    }
}
if (false) {
    /**
     * @abstract
     * @return {void}
     */
    Base.prototype.simple = function () { };
    /**
     * @abstract
     * @return {void}
     */
    Base.prototype.publicAbstract = function () { };
    /**
     * @abstract
     * @param {!Array<number>} x
     * @return {void}
     */
    Base.prototype.params = function (x) { };
    /**
     * @abstract
     * @return {?}
     */
    Base.prototype.noReturnType = function () { };
    /**
     * @abstract
     * @return {number}
     */
    Base.prototype.hasReturnType = function () { };
}
class Derived extends Base {
    constructor() {
        super();
    }
    /**
     * @return {void}
     */
    simple() { }
    /**
     * @return {void}
     */
    publicAbstract() { }
    /**
     * @param {!Array<number>} x
     * @return {void}
     */
    params(x) { }
    /**
     * @return {void}
     */
    noReturnType() { }
    /**
     * @return {number}
     */
    hasReturnType() { return 3; }
}
/** @type {!Base} */
let x = new Derived();
