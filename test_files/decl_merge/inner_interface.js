/**
 *
 * @fileoverview Ensure interfaces nested in an outer class or interface,
 * defined with declaration merging are properly transformed and hoisted out of
 * the namespace, and no iife is created for the namespace.
 *
 * Generated from: test_files/decl_merge/inner_interface.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.decl_merge.inner_interface');
var module = module || { id: 'test_files/decl_merge/inner_interface.ts' };
goog.require('tslib');
class OC {
    /**
     * @public
     * @param {!OC.J} j
     */
    constructor(j) {
        this.j = j;
        this.i = null;
    }
}
exports.OC = OC;
/* istanbul ignore if */
if (false) {
    /**
     * @type {(null|!OC.I)}
     * @public
     */
    OC.prototype.i;
    /**
     * @type {!OC.J}
     * @private
     */
    OC.prototype.j;
}
/**
 * @record
 */
function OI() { }
exports.OI = OI;
/**
 * Bla interface
 * @record
 */
function OC$I() { }
/* istanbul ignore if */
if (false) {
    /**
     * @public
     * @param {!OI.E} e
     * @return {void}
     */
    OC$I.prototype.bar = function (e) { };
}
/** @const */
OC.I = OC$I;
/**
 * @record
 * @extends {OC.I}
 */
function OC$J() { }
/* istanbul ignore if */
if (false) {
    /**
     * @public
     * @param {!OC.I} i
     * @return {!OC.J}
     */
    OC$J.prototype.foo = function (i) { };
}
/** @const */
OC.J = OC$J;
/**
 * Bla enum
 * @enum {number}
 */
const OI$E = {
    a: 0, b: 1,
};
OI$E[OI$E.a] = 'a';
OI$E[OI$E.b] = 'b';
/** @const */
OI.E = OI$E;
/** @const */
OI.C1 = 0;
/** @const */
OI.C2 = 'string const';
/** Bla const */
/** @const */
OI.C3 = OI.E.a;
/**
 * @param {!OC.J} j
 * @return {!OC.J}
 */
function f(j) {
    return j.foo(j);
}
/**
 * @return {!OI.E}
 */
function g() {
    return OI.E.a;
}
