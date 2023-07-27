// test_files/decorator/export_const.ts(15,14): warning TS0: unhandled anonymous type with constructor signature but no declaration
goog.module('test_files.decorator.export_const');
var module = module || { id: 'test_files/decorator/export_const.ts' };
const tslib_1 = goog.require('tslib');
/**
 *
 * @fileoverview Decorated class, whose type and value are exported separately.
 * The value used afterwards.
 *
 * Generated from: test_files/decorator/export_const.ts
 */
/**
 * @param {?} t
 * @return {?}
 */
function classDecorator(t) {
    return t;
}
let FooImpl = class FooImpl {
};
/** @suppress {visibility} */
FooImpl = tslib_1.__decorate([
    classDecorator
], FooImpl);
/** @type {?} */
exports.Foo = FooImpl;
console.log(exports.Foo);
