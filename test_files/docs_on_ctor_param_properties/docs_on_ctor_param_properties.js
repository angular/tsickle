/**
 * @fileoverview added by tsickle
 * Generated from: test_files/docs_on_ctor_param_properties/docs_on_ctor_param_properties.ts
 * @suppress {checkTypes,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.docs_on_ctor_param_properties.docs_on_ctor_param_properties');
var module = module || { id: 'test_files/docs_on_ctor_param_properties/docs_on_ctor_param_properties.ts' };
goog.require('tslib');
class Clazz {
    /**
     * @param {!Array<string>} id
     * @param {!Array<string>=} parameterProperty
     */
    constructor(id, parameterProperty = []) {
        this.id = id;
        this.parameterProperty = parameterProperty;
    }
}
exports.Clazz = Clazz;
/* istanbul ignore if */
if (COMPILED) {
    /** @type {!Array<string>} */
    Clazz.prototype.id;
    /**
     * Here is a docstring for the parameter property.
     * @type {!Array<string>}
     */
    Clazz.prototype.parameterProperty;
}
