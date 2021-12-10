/**
 *
 * @fileoverview undefined
 * Generated from: test_files/namespaced/reopen_ns.ts
 * @suppress {checkTypes,const,constantProperty,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode}
 *
 */
goog.module('test_files.namespaced.reopen_ns');
var module = module || { id: 'test_files/namespaced/reopen_ns.ts' };
goog.require('tslib');
// TODO(#132): 'export namespace' currently don't emit properly.
// This workaround at least makes them compile.
// It's useful to keep at least one instance of this workaround
// in the test suite to ensure it also continues working.
// @ts-ignore
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
