/**
 *
 * @fileoverview
 * Generated from: test_files/ctors/ctors.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.ctors.ctors');
var module = module || { id: 'test_files/ctors/ctors.ts' };
goog.require('tslib');
/** @type {function(new:Document)} */
let x = Document;
class X {
    /**
     * @public
     * @param {number} a
     */
    constructor(a) {
        this.a = a;
    }
}
/* istanbul ignore if */
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
     * @public
     * @param {(string|number)} a
     */
    constructor(a) {
        this.a = a;
    }
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {(string|number)}
     * @private
     */
    OverloadedCtor.prototype.a;
}
