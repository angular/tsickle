/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
goog.module('test_files.typedef.typedef');
var module = module || { id: 'test_files/typedef/typedef.ts' };
module = module;
exports = {};
/** @type {number} */
var y = 3;
/** @typedef {{value: number, next: ?}} */
exports.Recursive;
/** @typedef {string} */
exports.ExportedType;
// tsickle introduces aliases when defining local typedefs. Make sure that the typedef can still be
// used before its definition, because local typedefs are resolved to their underlying type when
// emitting types.
/** @type {number} */
const useTypedefBeforeDefinition = 1;
/** @typedef {number} */
exports.UsedBeforeDefinition;
