/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
goog.module('test_files.promisectorlike.promisectorlike');
var module = module || { id: 'test_files/promisectorlike/promisectorlike.ts' };
/**
 * @param {function(new: (!PromiseLike<?>), function(function((undefined|?|!PromiseLike<?>)=): void, function(?=): void): void): ?} ctorLike
 * @return {!Promise<string>}
 */
function toPromise(ctorLike) {
    return /** @type {!Promise<string>} */ (new ctorLike((resolve, reject) => {
        reject('grumpycat');
    }));
}
