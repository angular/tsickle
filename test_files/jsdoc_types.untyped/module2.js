/**
 *
 * @fileoverview
 * Generated from: test_files/jsdoc_types.untyped/module2.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.jsdoc_types.untyped.module2');
var module = module || { id: 'test_files/jsdoc_types.untyped/module2.ts' };
goog.require('tslib');
class ClassOne {
}
exports.ClassOne = ClassOne;
class ClassTwo {
}
exports.ClassTwo = ClassTwo;
/**
 * @record
 */
function Interface() { }
exports.Interface = Interface;
/* istanbul ignore if */
if (false) {
    /**
     * @type {?}
     * @public
     */
    Interface.prototype.x;
}
/**
 * @template T
 */
class ClassWithParams {
}
exports.ClassWithParams = ClassWithParams;
/** @typedef {?} */
exports.TypeAlias;
/** @typedef {?} */
exports.TypeAliasWithParam;
/** @type {?} */
exports.value = 3;
