/**
 * @fileoverview added by tsickle
 * Generated from: test_files/generic_fn_type/generic_fn_type.ts
 */
goog.module('test_files.generic_fn_type.generic_fn_type');
var module = module || { id: 'test_files/generic_fn_type/generic_fn_type.ts' };
goog.require('tslib');
/**
 * A function type that includes a generic type argument. Unsupported by
 * Closure, so tsickle should emit ?.
 * @type {function(?): ?}
 */
let genericFnType = (/**
 * @param {?} x
 * @return {?}
 */
(x) => x);
/** @type {function(new:?, ?)} */
let genericCtorFnType;
