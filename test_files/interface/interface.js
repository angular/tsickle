goog.module('test_files.interface.interface');var module = module || {id: 'test_files/interface/interface.js'};/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

/**
 * Used by implement_import.ts
 * @record
 */
function Point() { }
exports.Point = Point;
function Point_tsickle_Closure_declarations() {
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
function User_tsickle_Closure_declarations() {
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
let /** @type {!Point} */ p = { x: 1, y: 1 };
usePoint(p);
usePoint({ x: 1, y: 1 });
/**
 * @record
 */
function TrickyInterface() { }
function TrickyInterface_tsickle_Closure_declarations() {
    /* TODO: handle strange member:
    [offset: number]: number;
    */
    /** @type {number} */
    TrickyInterface.prototype.foo;
    /* TODO: handle strange member:
    (x: number): __ yuck __
          number;
    */
    /** @type {(string|string)|undefined} */
    TrickyInterface.prototype.foobar;
    /** @type {(?|string)|undefined} */
    TrickyInterface.prototype.optAny;
    /**
     * \@param a some string value
     * \@return some number value
     * @override
     * @type {function(string): number}
     */
    TrickyInterface.prototype.hasSomeParamJsDoc;
}
