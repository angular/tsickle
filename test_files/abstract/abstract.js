/**
 *
 * @fileoverview
 * Generated from: test_files/abstract/abstract.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.abstract.abstract');
var module = module || { id: 'test_files/abstract/abstract.ts' };
goog.require('tslib');
/**
 * @abstract
 */
class Base {
    /**
     * @public
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
/* istanbul ignore if */
if (false) {
    /**
     * @abstract
     * @public
     * @return {void}
     */
    Base.prototype.simple = function () { };
    /**
     * @abstract
     * @public
     * @return {void}
     */
    Base.prototype.publicAbstract = function () { };
    /**
     * @abstract
     * @public
     * @param {!Array<number>} x
     * @return {void}
     */
    Base.prototype.params = function (x) { };
    /**
     * @abstract
     * @public
     * @return {?}
     */
    Base.prototype.noReturnType = function () { };
    /**
     * @abstract
     * @public
     * @return {number}
     */
    Base.prototype.hasReturnType = function () { };
}
/**
 * @extends {Base}
 */
class Derived extends Base {
    // Workaround for https://github.com/google/closure-compiler/issues/1955
    /**
     * @public
     */
    constructor() {
        super();
    }
    /**
     * @public
     * @return {void}
     */
    simple() { }
    /**
     * @public
     * @return {void}
     */
    publicAbstract() { }
    /**
     * @public
     * @param {!Array<number>} x
     * @return {void}
     */
    params(x) { }
    /**
     * @public
     * @return {void}
     */
    noReturnType() { }
    /**
     * @public
     * @return {number}
     */
    hasReturnType() {
        return 3;
    }
}
/** @type {!Base} */
let x = new Derived();
