/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
goog.module('test_files.generic_local_var.generic_local_var');
var module = module || { id: 'test_files/generic_local_var/generic_local_var.ts' };
module = module;
exports = {};
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
        // Closure Compiler's Old Type Inference does not support using generic
        // method parameters as local symbols, so myU must be emitted as ?.
        /** @type {?} */
        const myU = u;
        console.log(myT, myU);
    }
}
if (false) {
    /** @type {T} */
    Container.prototype.tField;
}
