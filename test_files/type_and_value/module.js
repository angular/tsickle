// test_files/type_and_value/module.ts(7,1): warning TS0: type/symbol conflict for TypeAndValue, using {?} for now
// test_files/type_and_value/module.ts(12,1): warning TS0: type/symbol conflict for TemplatizedTypeAndValue, using {?} for now
/**
 *
 * @fileoverview TypeAndValue is both a type and a value, which is allowed in
 * TypeScript but disallowed in Closure.
 * Generated from: test_files/type_and_value/module.ts
 * @suppress {uselessCode}
 *
 */
// WARNING: interface has both a type and a value, skipping emit
goog.module('test_files.type_and_value.module');
var module = module || { id: 'test_files/type_and_value/module.ts' };
goog.require('tslib');
/** @type {number} */
exports.TypeAndValue = 3;
// WARNING: interface has both a type and a value, skipping emit
/** @type {number} */
exports.TemplatizedTypeAndValue = 1;
class Class {
}
exports.Class = Class;
/* istanbul ignore if */
if (false) {
    /**
     * @type {number}
     * @public
     */
    Class.prototype.z;
}
/** @enum {number} */
const Enum = {
    A: 0,
};
exports.Enum = Enum;
Enum[Enum.A] = 'A';
