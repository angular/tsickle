/**
 *
 * @fileoverview This file isn't itself a test case, but it is imported by the
 * export.in.ts test case.
 * Generated from: test_files/export/export_helper_2.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.export.export_helper_2');
var module = module || { id: 'test_files/export/export_helper_2.ts' };
goog.require('tslib');
/** @type {number} */
exports.export2 = 3;
/** @type {number} */
exports.export3 = 3;
/** @type {number} */
exports.export4 = 3;
/** @typedef {(string|number)} */
exports.TypeDef;
/**
 * @record
 */
function Interface() { }
exports.Interface = Interface;
/* istanbul ignore if */
if (false) {
    /**
     * @type {string}
     * @public
     */
    Interface.prototype.x;
}
/** @enum {number} */
const ConstEnum = {
    AValue: 1,
};
exports.ConstEnum = ConstEnum;
/** @typedef {!test_files$export$export_helper_2.DeclaredType} */
exports.DeclaredType;
/** @typedef {!test_files$export$export_helper_2.DeclaredInterface} */
exports.DeclaredInterface;
