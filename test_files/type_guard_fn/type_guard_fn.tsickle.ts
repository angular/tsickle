/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */


/**
 * @param {!Object} a
 * @return {boolean}
 */
export function isBoolean(a: {}): a is string {
  return typeof a === 'string';
}
/**
 * @template T
 * @param {!Object} obj
 * @return {boolean}
 */
function isThenable<T>(obj: object): obj is PromiseLike<T> {
  return true;
}
