/**
 * @fileoverview added by tsickle
 * Generated from: test_files/generic_local_var/generic_local_var.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.generic_local_var.generic_local_var');
var module = module || { id: 'test_files/generic_local_var/generic_local_var.ts' };
module = module;
goog.require('tslib');
/**
 * @template T
 */
class Container {
    /**
     * @param {T} tField
     */
    constructor(tField) {
        this.tField = tField;
    }
    /**
     * @template U
     * @param {U} u
     * @return {void}
     */
    method(u) {
        /** @type {T} */
        const myT = this.tField;
        // Closure Compiler previously did not accept local variables using generic
        // types within a generic method's scope. This test now serves as a
        // regression test for the inverse, i.e. that tsickle now emits the type.
        /** @type {U} */
        const myU = u;
        console.log(myT, myU);
    }
}
if (false) {
    /**
     * @type {T}
     * @private
     */
    Container.prototype.tField;
}
