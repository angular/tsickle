/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire} checked by tsc
 */
goog.module('test_files.generic_local_var.generic_local_var');
var module = module || { id: 'test_files/generic_local_var/generic_local_var.ts' };
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
        /** @type {?} */
        const myU = u;
        console.log(myT, myU);
    }
}
function Container_tsickle_Closure_declarations() {
    /** @type {T} */
    Container.prototype.tField;
}
