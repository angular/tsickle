/**
 *
 * @fileoverview
 * Generated from: test_files/interface/interface.ts
 * @suppress {uselessCode}
 *
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
    /**
     * @type {number}
     * @public
     */
    Point.prototype.x;
    /**
     * @type {number}
     * @public
     */
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
    /**
     * @type {number}
     * @public
     */
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
    /**
     * @type {number}
     * @public
     */
    TrickyInterface.prototype.foo;
    /**
     * @type {(undefined|string)}
     * @public
     */
    TrickyInterface.prototype.foobar;
    /**
     * @type {?|undefined}
     * @public
     */
    TrickyInterface.prototype.optAny;
    /**
     * \@param a some string value
     * \@return some number value
     * @override
     * @type {function(string): number}
     * @public
     */
    TrickyInterface.prototype.hasSomeParamJsDoc;
    /* Skipping illegal member name:
    prototype: string;*/
    /* Skipping unhandled member: [offset: number]: number;*/
    /* Skipping unhandled member: (x: number): __ yuck __
          number;*/
}
