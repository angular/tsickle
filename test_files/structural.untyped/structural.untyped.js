/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
goog.module('test_files.structural.untyped.structural.untyped');
var module = module || { id: 'test_files/structural.untyped/structural.untyped.ts' };
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
/**
 * @param {?} st
 * @return {?}
 */
function expectsAStructuralTest(st) { }
expectsAStructuralTest({ field1: 'hi', method: () => 'hi' });
