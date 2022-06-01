/**
 * @fileoverview added by tsickle
 * Generated from: test_files/typedef/typedef.ts
 */
goog.module('test_files.typedef.typedef');
var module = module || { id: 'test_files/typedef/typedef.ts' };
goog.require('tslib');
/** @typedef {number} */
var MyType;
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
