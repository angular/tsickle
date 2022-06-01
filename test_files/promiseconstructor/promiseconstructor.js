/**
 *
 * @fileoverview typeof Promise actually resolves to "PromiseConstructor" in
 * TypeScript, which is a type that doesn't exist in Closure's type world. This
 * code passes the e2e test because closure_externs.js declares
 * PromiseConstructor.
 * Generated from: test_files/promiseconstructor/promiseconstructor.ts
 * @suppress {checkTypes}
 *
 */
goog.module('test_files.promiseconstructor.promiseconstructor');
var module = module || { id: 'test_files/promiseconstructor/promiseconstructor.ts' };
goog.require('tslib');
/**
 * @param {(undefined|!PromiseConstructor)=} promiseCtor
 * @return {!Promise<void>}
 */
function f(promiseCtor) {
    return promiseCtor ? new promiseCtor((/**
     * @param {function((void|!PromiseLike<void>)): void} res
     * @param {function(?=): void} rej
     * @return {void}
     */
    (res, rej) => res())) : Promise.resolve();
}
