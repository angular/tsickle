/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.promisectorlike.promisectorlike');
var module = module || { id: 'test_files/promisectorlike/promisectorlike.ts' };
module = module;
exports = {};
/**
 * @param {function(new:PromiseLike<?>, function(function((undefined|?|!PromiseLike<?>)=): void, function(?=): void): void)} ctorLike
 * @return {!Promise<string>}
 */
function toPromise(ctorLike) {
    return (/** @type {!Promise<string>} */ (new ctorLike((/**
     * @param {function((undefined|string|!PromiseLike<string>)=): void} resolve
     * @param {function(?=): void} reject
     * @return {void}
     */
    (resolve, reject) => {
        reject('grumpycat');
    }))));
}
