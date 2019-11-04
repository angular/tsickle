/**
 * @fileoverview added by tsickle
 * Generated from: test_files/ctors/ctors.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.ctors.ctors');
var module = module || { id: 'test_files/ctors/ctors.ts' };
module = module;
/** @type {function(new:Document)} */
let x = Document;
class X {
    /**
     * @param {number} a
     */
    constructor(a) {
        this.a = a;
    }
}
if (false) {
    /**
     * @type {number}
     * @private
     */
    X.prototype.a;
}
/** @type {function(new:X, number)} */
let y = X;
class OverloadedCtor {
    /**
     * @param {(string|number)} a
     */
    constructor(a) {
        this.a = a;
    }
}
if (false) {
    /**
     * @type {(string|number)}
     * @private
     */
    OverloadedCtor.prototype.a;
}
