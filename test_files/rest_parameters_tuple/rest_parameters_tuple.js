// test_files/rest_parameters_tuple/rest_parameters_tuple.ts(6,20): warning TS0: failed to resolve rest parameter type, emitting ?
/**
 *
 * @fileoverview Tests that complex union/tuple types for rest parameters get emitted as a fallback
 * '?' unknown type.
 *
 * Generated from: test_files/rest_parameters_tuple/rest_parameters_tuple.ts
 * @suppress {checkTypes,const,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.rest_parameters_tuple.rest_parameters_tuple');
var module = module || { id: 'test_files/rest_parameters_tuple/rest_parameters_tuple.ts' };
goog.require('tslib');
/**
 * @param {...?} args
 * @return {void}
 */
function fn(...args) { }
exports.fn = fn;
