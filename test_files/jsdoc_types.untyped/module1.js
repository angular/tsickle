// test_files/jsdoc_types.untyped/module1.ts(9,3): warning TS0: handle unnamed member:
// 'quoted-bad-name': string;
/**
 *
 * @fileoverview
 * Generated from: test_files/jsdoc_types.untyped/module1.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.jsdoc_types.untyped.module1');
var module = module || { id: 'test_files/jsdoc_types.untyped/module1.ts' };
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
     * @type {?}
     * @public
     */
    Interface.prototype.x;
    /* Skipping unnamed member:
    'quoted-bad-name': string;*/
}
