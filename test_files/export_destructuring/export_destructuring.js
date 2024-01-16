goog.module('test_files.export_destructuring.export_destructuring');
var module = module || { id: 'test_files/export_destructuring/export_destructuring.ts' };
goog.require('tslib');
var _a;
/**
 * @fileoverview added by tsickle
 * Generated from: test_files/export_destructuring/export_destructuring.ts
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
const [a__tsickle_destructured_1, b__tsickle_destructured_2] = signal(0);
exports.a = /** @type {number} */ (a__tsickle_destructured_1);
exports.b = /** @type {number} */ (b__tsickle_destructured_2);
_a = objectLiteral(0);
exports.c = _a.c;
exports.d = _a.d;
