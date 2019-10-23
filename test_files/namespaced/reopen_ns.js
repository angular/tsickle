/**
 * @fileoverview added by tsickle
 * Generated from: test_files/namespaced/reopen_ns.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.namespaced.reopen_ns');
var module = module || { id: 'test_files/namespaced/reopen_ns.ts' };
module = module;
exports = {};
var ns;
(function (ns) {
    ns.x = 0;
})(ns = exports.ns || (exports.ns = {}));
(function (ns) {
    ns.y = 0;
})(ns = exports.ns || (exports.ns = {}));
// this implicitly re-emits `ns = exports.ns || (exports.ns = {}));`, so it is
// in a way reopening ns, which can cause issues with Closure unless the right
// suppressions are present.
(function (ns) {
    var bar;
    (function (bar) {
        bar.y = 0;
    })(bar = ns.bar || (ns.bar = {}));
})(ns = exports.ns || (exports.ns = {}));
