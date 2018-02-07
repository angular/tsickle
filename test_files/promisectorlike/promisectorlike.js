/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
goog.module('test_files.promisectorlike.promisectorlike');var module = module || {id: 'test_files/promisectorlike/promisectorlike.js'};/**
 * @param {PromiseConstructorLike} ctorLike
 * @return {!Promise<string>}
 */
function toPromise(ctorLike) {
    return /** @type {!Promise<string>} */ (new ctorLike((resolve, reject) => {
        reject('grumpycat');
    }));
}
