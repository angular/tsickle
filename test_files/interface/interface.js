goog.module('tsickle_test.interface.interface');/** @record */
function Point() { }
/** @type {number} */
Point.prototype.x;
/** @type {number} */
Point.prototype.y;
/**
 * @param {Point} p
 * @return {number}
 */
function usePoint(p) {
    return p.x + p.y;
}
let /** @type {Point} */ p = { x: 1, y: 1 };
usePoint(p);
usePoint({ x: 1, y: 1 });
/** @record */
function TrickyInterface() { }
/* TODO: handle strange member:
[offset: number]: number;
*/
/** @type {number} */
TrickyInterface.prototype.foo;
