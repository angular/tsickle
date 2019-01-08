/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
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
// Verify the same thing in a namespace.
// We don't rely on namespaces really but the logic around generating type
// names has some logic near namespaces so we might as well verify the output
// looks ok.
var ns;
(function (ns) {
    ns.anonInstance2 = new class {
    };
    ns.anonClass = class {
    };
})(ns || (ns = {}));
/** @type {?} */
const aliasToAnon = ns.anonInstance2;
/** @type {?} */
const anonClassNs = new ns.anonClass();
