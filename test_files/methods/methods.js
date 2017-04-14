goog.module('test_files.methods.methods');var module = module || {id: 'test_files/methods/methods.js'};/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes}
 */
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
function HasMethods_tsickle_Closure_declarations() {
    /** @type {number} */
    HasMethods.prototype._f;
}
