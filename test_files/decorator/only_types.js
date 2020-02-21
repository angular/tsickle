/**
 *
 * @fileoverview only_types only exports types, so TypeScript will elide the
 * import entirely.
 *
 * Generated from: test_files/decorator/only_types.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.decorator.only_types');
var module = module || { id: 'test_files/decorator/only_types.ts' };
module = module;
goog.require('tslib');
/**
 * @record
 */
function AnotherType() { }
exports.AnotherType = AnotherType;
if (false) {
    /** @type {string} */
    AnotherType.prototype.field;
}
