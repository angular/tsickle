// test_files/jsdoc_types.untyped/module1.ts(4,3): warning TS0: handle unnamed member:
// "quoted-bad-name": string;
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
goog.module('test_files.jsdoc_types.untyped.module1');
var module = module || { id: 'test_files/jsdoc_types.untyped/module1.ts' };
module = module;
exports = {};
class Class {
}
exports.Class = Class;
/**
 * @record
 */
function Interface() { }
exports.Interface = Interface;
if (false) {
    /** @type {?} */
    Interface.prototype.x;
    /* Skipping unnamed member:
    "quoted-bad-name": string;*/
}
