/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.namespaced.mutable');
var module = module || { id: 'test_files/namespaced/mutable.ts' };
module = module;
exports = {};
/**
 * @const
 */
var mut = mut || {};
(function (mut) {
    /** @type {number} */
    mut.x = 0;
    //export let z = 0, w = 0;
    /** @type {number} */
    let y = 0;
    /**
     * @return {void}
     */
    function inc() {
        mut.x++;
        y++;
        //z++;
        //w++;
    }
    /**
     * @const
     */
    mut.inc = inc;
})(mut);
