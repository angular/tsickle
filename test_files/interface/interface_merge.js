/**
 *
 * @fileoverview Test to ensure that there is only one record declaration
 * for a merged interface.
 * Generated from: test_files/interface/interface_merge.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.interface.interface_merge');
var module = module || { id: 'test_files/interface/interface_merge.ts' };
goog.require('tslib');
/**
 * @record
 */
function Foo() { }
/* istanbul ignore if */
if (false) {
    /**
     * @public
     * @return {string}
     */
    Foo.prototype.bar = function () { };
}
/* istanbul ignore if */
if (false) {
    /**
     * @public
     * @return {number}
     */
    Foo.prototype.baz = function () { };
}
/**
 * @implements {Foo}
 */
class Foolish {
    /**
     * @public
     * @return {string}
     */
    bar() {
        return 'bar';
    }
    /**
     * @public
     * @return {number}
     */
    baz() {
        return 0;
    }
}
/**
 * @return {void}
 */
function A() {
    /**
     * @record
     */
    function I() { }
    /** @type {!I} */
    let i = {};
}
/**
 * @return {void}
 */
function B() {
    /**
     * @record
     */
    function I() { }
    /** @type {!I} */
    let i = {};
}
