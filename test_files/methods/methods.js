/**
 * @fileoverview added by tsickle
 * Generated from: test_files/methods/methods.ts
 * @suppress {checkTypes,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.methods.methods');
var module = module || { id: 'test_files/methods/methods.ts' };
goog.require('tslib');
class HasMethods {
    /**
     * @return {void}
     */
    one() { }
    /**
     * @param {string} a
     * @return {number}
     */
    two(a) { return 1; }
    /**
     * @return {number}
     */
    get f() { return this._f + 1; }
    /**
     * @param {number} n
     * @return {void}
     */
    set f(n) { this._f = n - 1; }
}
/* istanbul ignore if */
if (false) {
    /** @type {number} */
    HasMethods.prototype._f;
}
