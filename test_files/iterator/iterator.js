// test_files/iterator/iterator.ts(7,8): warning TS0: failed to resolve rest parameter type, emitting ?
/**
 * @fileoverview added by tsickle
 * Generated from: test_files/iterator/iterator.ts
 */
goog.module('test_files.iterator.iterator');
var module = module || { id: 'test_files/iterator/iterator.ts' };
goog.require('tslib');
/**
 * @implements {IterableIterator<string>}
 */
class MyIterable {
    /**
     * @public
     * @return {!IterableIterator<string>}
     */
    [Symbol.iterator]() {
        return this;
    }
    /**
     * @public
     * @param {...?} args
     * @return {(!IteratorYieldResult<string>|!IteratorReturnResult<string>)}
     */
    next(...args) {
        return { done: true, value: 'x' };
    }
}
