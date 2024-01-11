goog.module('test_files.export_destructuring.export_destructuring');
var module = module || { id: 'test_files/export_destructuring/export_destructuring.ts' };
goog.require('tslib');
var _a, _b;
/**
 *
 * @fileoverview
 * Generated from: test_files/export_destructuring/export_destructuring.ts
 * @suppress {undefinedVars}
 *
 */
/**
 * @param {number} n
 * @return {!Array<number>}
 */
function signal(n) {
    return [n, n + 1];
}
/**
 * @param {number} n
 * @return {{c: number, d: number}}
 */
function objectLiteral(n) {
    return { c: n, d: n + 1 };
}
_a = signal(0);
a__tsickle_destructured_1 = _a[0];
b__tsickle_destructured_2 = _a[1];
const a = /** @type {number} */ (a__tsickle_destructured_1);
const b = /** @type {number} */ (b__tsickle_destructured_2);
_b = objectLiteral(0);
exports.c = _b.c;
exports.d = _b.d;
