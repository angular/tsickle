/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.methods.methods');
var module = module || { id: 'test_files/methods/methods.ts' };
module = module;
exports = {};
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
if (false) {
    /** @type {number} */
    HasMethods.prototype._f;
}
