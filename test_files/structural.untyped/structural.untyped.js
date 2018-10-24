/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.structural.untyped.structural.untyped');
var module = module || { id: 'test_files/structural.untyped/structural.untyped.ts' };
module = module;
exports = {};
// Ensure that a class is structurally equivalent to an object literal
// with the same fields.
class StructuralTest {
    /**
     * @return {?}
     */
    method() { return this.field1; }
}
if (false) {
    /** @type {?} */
    StructuralTest.prototype.field1;
}
// The function expects a StructuralTest, but we pass it an object
// literal.
/**
 * @param {?} st
 * @return {?}
 */
function expectsAStructuralTest(st) { }
expectsAStructuralTest({ field1: 'hi', method: () => 'hi' });
