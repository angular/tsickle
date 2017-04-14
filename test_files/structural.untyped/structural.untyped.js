goog.module('test_files.structural.untyped.structural.untyped');var module = module || {id: 'test_files/structural.untyped/structural.untyped.js'};/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes}
 */
class StructuralTest {
    /**
     * @return {?}
     */
    method() { return this.field1; }
}
function StructuralTest_tsickle_Closure_declarations() {
    /** @type {?} */
    StructuralTest.prototype.field1;
}
/**
 * @param {?} st
 * @return {?}
 */
function expectsAStructuralTest(st) { }
expectsAStructuralTest({ field1: 'hi', method: () => 'hi' });
