/**
 * @fileoverview added by tsickle
 * Generated from: test_files/promisectorlike/promisectorlike.ts
 */
goog.module('test_files.promisectorlike.promisectorlike');
var module = module || { id: 'test_files/promisectorlike/promisectorlike.ts' };
goog.require('tslib');
/**
 * @param {function(new:PromiseLike<?>, function(function((?|!PromiseLike<?>)): void, function(?=): void): void)} ctorLike
 * @return {!Promise<string>}
 */
function toPromise(ctorLike) {
    return (/** @type {!Promise<string>} */ (new ctorLike((/**
     * @param {function((string|!PromiseLike<string>)): void} resolve
     * @param {function(?=): void} reject
     * @return {void}
     */
    (resolve, reject) => {
        reject('grumpycat');
    }))));
}
