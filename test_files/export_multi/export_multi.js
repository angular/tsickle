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
    b: 2
};
exports.a = _a.a;
exports.b = _a.b;
