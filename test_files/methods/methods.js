/**
 *
 * @fileoverview
 * Generated from: test_files/methods/methods.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.methods.methods');
var module = module || { id: 'test_files/methods/methods.ts' };
goog.require('tslib');
class HasMethods {
    /**
     * @public
     * @return {void}
     */
    one() { }
    /**
     * @public
     * @param {string} a
     * @return {number}
     */
    two(a) {
        return 1;
    }
    /**
     * @public
     * @return {number}
     */
    get f() {
        return this._f + 1;
    }
    /**
     * @public
     * @param {number} n
     * @return {void}
     */
    set f(n) {
        this._f = n - 1;
    }
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {number}
     * @public
     */
    HasMethods.prototype._f;
}
