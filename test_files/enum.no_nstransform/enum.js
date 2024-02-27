/**
 * @fileoverview Check that enums are translated to a var declaration
 *   when namespace transformation is turned off, i.e. the build target
 *   has the attribute --allow_unoptimized_namespaces.
 * Generated from: test_files/enum.no_nstransform/enum.ts
 * @suppress {checkTypes,uselessCode}
 */
goog.module('test_files.enum.no_nstransform.enum');
var module = module || { id: 'test_files/enum.no_nstransform/enum.ts' };
goog.require('tslib');
/**
 * This enum should be translated to `var E = {...}` instead of the usual
 * `const E = {...}`
 * @enum {number}
 */
var E = {
    e0: 0,
    e1: 1,
    e2: 2,
};
exports.E = E;
E[E.e0] = 'e0';
E[E.e1] = 'e1';
E[E.e2] = 'e2';
// We need to emit the enum as a var declaration so that declaration
// merging with a namespace works. The unoptimized namespace is emitted
// by tsc as a var declaration and an IIFE.
var E;
(function (E) {
    /**
     * @param {string} s
     * @return {?}
     */
    function fromString(s) {
        return E.e0;
    }
    E.fromString = fromString;
})(E || (E = {}));
/** @type {!E} */
const foo = E.e2;
