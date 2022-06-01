goog.module('test_files.export_multi.export_multi');
var module = module || { id: 'test_files/export_multi/export_multi.ts' };
goog.require('tslib');
var _a, _b;
/**
 *
 * @fileoverview Some export forms that create multi-expression 'export'
 * statements, which are illegal under Closure and must be rewritten.
 *
 * Generated from: test_files/export_multi/export_multi.ts
 */
/** @enum {string} */
const Fruit = {
    APPLE: "apple",
    PEAR: "pear",
    ORANGE: "orange",
};
exports.APPLE = Fruit.APPLE;
exports.PEAR = Fruit.PEAR;
exports.ORANGE = Fruit.ORANGE;
_a = {
    a: 1,
    b: 2,
};
exports.a = _a.a;
exports.b = _a.b;
/**
 * @return {?}
 */
function foo() { }
// Comma expressions with more than 10 elements get represented in the
// TypeScript AST as a unique CommaListExpression node, so we need an export
// with at least 10 names in order to cover that case in tsickle.
_b = foo();
exports.A = _b.A;
exports.B = _b.B;
exports.C = _b.C;
exports.D = _b.D;
exports.E = _b.E;
exports.F = _b.F;
exports.G = _b.G;
exports.H = _b.H;
exports.I = _b.I;
exports.J = _b.J;
