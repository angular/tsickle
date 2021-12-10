// test_files/jsdoc_types/module1.ts(4,3): warning TS0: handle unnamed member:
// "quoted-bad-name": string;
/**
 * @fileoverview added by tsickle
 * Generated from: test_files/jsdoc_types/module1.ts
 * @suppress {checkTypes,const,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.jsdoc_types.module1');
var module = module || { id: 'test_files/jsdoc_types/module1.ts' };
goog.require('tslib');
class Class {
}
exports.Class = Class;
/**
 * @record
 */
function Interface() { }
exports.Interface = Interface;
/* istanbul ignore if */
if (false) {
    /**
     * @type {number}
     * @public
     */
    Interface.prototype.x;
    /* Skipping unnamed member:
    "quoted-bad-name": string;*/
}
