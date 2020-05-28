// test_files/jsdoc_types/module1.ts(4,3): warning TS0: handle unnamed member:
// "quoted-bad-name": string;
/**
 * @fileoverview added by tsickle
 * Generated from: test_files/jsdoc_types/module1.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.jsdoc_types.module1');
var module = module || { id: 'test_files/jsdoc_types/module1.ts' };
module = module;
goog.require('tslib');
class Class {
}
exports.Class = Class;
/**
 * @record
 */
function Interface() { }
exports.Interface = Interface;
if (false) {
    /** @type {number} */
    Interface.prototype.x;
    /* Skipping unnamed member:
    "quoted-bad-name": string;*/
}
