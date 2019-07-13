/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
// tslint:disable:no-namespace
goog.module('test_files.namespaced.nested');
var module = module || { id: 'test_files/namespaced/nested.ts' };
module = module;
exports = {};
/**
 * @const
 */
var outer = outer || {};
(function (outer) {
    /**
     * @const
     */
    var inner = inner || {};
    (function (inner) {
        /** @type {number} */
        const x = 1;
        /**
         * @const
         */
        inner.x = x;
    })(inner);
    /**
     * @const
     */
    outer.inner = inner;
    (function (inner) {
        /** @type {number} */
        const y = 2;
        /**
         * @const
         */
        inner.y = y;
    })(inner);
})(outer);
/**
 * @const
 */
exports.outer = outer;
