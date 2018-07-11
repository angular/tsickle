/**
 * @fileoverview See user.ts for the actual test.
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
goog.module('test_files.implement_reexported_interface.interface');
var module = module || { id: 'test_files/implement_reexported_interface/interface.ts' };
module = module;
exports = {};
/**
 * @record
 */
function ExportedInterface() { }
exports.ExportedInterface = ExportedInterface;
/** @type {string} */
ExportedInterface.prototype.fooStr;
