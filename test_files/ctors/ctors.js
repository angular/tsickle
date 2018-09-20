/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
goog.module('test_files.ctors.ctors');
var module = module || { id: 'test_files/ctors/ctors.ts' };
module = module;
exports = {};
/** @type {function(new: (!Document)): ?} */
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
    /** @type {number} */
    X.prototype.a;
}
/** @type {function(new: (!X), number): ?} */
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
    /** @type {(string|number)} */
    OverloadedCtor.prototype.a;
}
