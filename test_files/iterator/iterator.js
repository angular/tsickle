// test_files/iterator/iterator.ts(7,8): warning TS0: failed to resolve rest parameter type, emitting ?
/**
 * @fileoverview added by tsickle
 * Generated from: test_files/iterator/iterator.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.iterator.iterator');
var module = module || { id: 'test_files/iterator/iterator.ts' };
module = module;
/**
 * @implements {IterableIterator}
 */
class MyIterable {
    /**
     * @return {!IterableIterator<string>}
     */
    [Symbol.iterator]() {
        return this;
    }
    /**
     * @param {...?} args
     * @return {(!IteratorYieldResult<string>|!IteratorReturnResult<string>)}
     */
    next(...args) {
        return { done: true, value: 'x' };
    }
}
