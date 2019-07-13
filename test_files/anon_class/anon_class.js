/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
// Verify we don't produce a type mentioning 'anonymous class'
// for variables that involve anonymous classes.  Instead we just
// produce {?}.
goog.module('test_files.anon_class.anon_class');
var module = module || { id: 'test_files/anon_class/anon_class.ts' };
module = module;
exports = {};
/** @type {?} */
const anonClassInstance = new class {
};
/**
 * @const
 */
var ns = ns || {};
(function (ns) {
    /** @type {?} */
    const anonInstance2 = new class {
    };
    /**
     * @const
     */
    ns.anonInstance2 = anonInstance2;
    /** @type {?} */
    const anonClass = class {
    };
    /**
     * @const
     */
    ns.anonClass = anonClass;
})(ns);
/** @type {?} */
const aliasToAnon = ns.anonInstance2;
/** @type {?} */
const anonClassNs = new ns.anonClass();
