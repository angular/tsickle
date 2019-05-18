// test_files/type_and_value/module.ts(3,1): warning TS0: type/symbol conflict for TypeAndValue, using {?} for now
// test_files/type_and_value/module.ts(6,1): warning TS0: type/symbol conflict for TemplatizedTypeAndValue, using {?} for now
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
// WARNING: interface has both a type and a value, skipping emit
goog.module('test_files.type_and_value.module');
var module = module || { id: 'test_files/type_and_value/module.ts' };
module = module;
exports = {};
/** @type {number} */
exports.TypeAndValue = 3;
// WARNING: interface has both a type and a value, skipping emit
/** @type {number} */
exports.TemplatizedTypeAndValue = 1;
class Class {
}
exports.Class = Class;
if (false) {
    /** @type {number} */
    Class.prototype.z;
}
