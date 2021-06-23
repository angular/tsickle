/**
 * @fileoverview See user.ts for the actual test.
 * Generated from: test_files/implement_reexported_interface/interface.ts
 * @suppress {checkTypes,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.implement_reexported_interface.interface');
var module = module || { id: 'test_files/implement_reexported_interface/interface.ts' };
goog.require('tslib');
/**
 * @record
 */
function ExportedInterface() { }
exports.ExportedInterface = ExportedInterface;
/* istanbul ignore if */
if (COMPILED) {
    /** @type {string} */
    ExportedInterface.prototype.fooStr;
}
