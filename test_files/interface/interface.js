/**
 * @fileoverview added by tsickle
 * Generated from: test_files/interface/interface.ts
 * @suppress {checkTypes,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.interface.interface');
var module = module || { id: 'test_files/interface/interface.ts' };
goog.require('tslib');
/**
 * Used by implement_import.ts
 * @record
 */
function Point() { }
exports.Point = Point;
/* istanbul ignore if */
if (false) {
    /** @type {number} */
    Point.prototype.x;
    /** @type {number} */
    Point.prototype.y;
}
/**
 * Used by implement_import.ts
 */
class User {
}
exports.User = User;
/* istanbul ignore if */
if (false) {
    /** @type {number} */
    User.prototype.shoeSize;
}
/**
 * @param {!Point} p
 * @return {number}
 */
function usePoint(p) {
    return p.x + p.y;
}
/** @type {!Point} */
let p = { x: 1, y: 1 };
usePoint(p);
usePoint({ x: 1, y: 1 });
/**
 * @record
 */
function TrickyInterface() { }
/* istanbul ignore if */
if (false) {
    /** @type {number} */
    TrickyInterface.prototype.foo;
    /** @type {(undefined|string)} */
    TrickyInterface.prototype.foobar;
    /** @type {?|undefined} */
    TrickyInterface.prototype.optAny;
    /**
     * \@param a some string value
     * \@return some number value
     * @override
     * @type {function(string): number}
     */
    TrickyInterface.prototype.hasSomeParamJsDoc;
    /* Skipping illegal member name:
    prototype: string;*/
    /* Skipping unhandled member: [offset: number]: number;*/
    /* Skipping unhandled member: (x: number): __ yuck __
          number;*/
}
