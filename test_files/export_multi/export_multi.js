goog.module('test_files.export_multi.export_multi');
var module = module || { id: 'test_files/export_multi/export_multi.ts' };
module = module;
exports = {};
var _a;
/**
 *
 * @fileoverview Some export forms that create multi-expression 'export'
 * statements, which are illegal under Closure and must be rewritten.
 *
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
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
    c: 3,
    d: 4,
    e: 5,
    f: 6,
    g: 7,
    h: 8,
    i: 9,
    j: 10
};
exports.a = _a.a;
exports.b = _a.b;
exports.c = _a.c;
exports.d = _a.d;
exports.e = _a.e;
exports.f = _a.f;
exports.g = _a.g;
exports.h = _a.h;
exports.i = _a.i;
exports.j = _a.j;
