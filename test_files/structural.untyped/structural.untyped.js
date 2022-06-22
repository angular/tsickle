/**
 *
 * @fileoverview Ensure that a class is structurally equivalent to an object
 * literal with the same fields.
 * Generated from: test_files/structural.untyped/structural.untyped.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.structural.untyped.structural.untyped');
var module = module || { id: 'test_files/structural.untyped/structural.untyped.ts' };
goog.require('tslib');
class StructuralTest {
    /**
     * @public
     * @return {?}
     */
    method() {
        return this.field1;
    }
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {?}
     * @public
     */
    StructuralTest.prototype.field1;
}
// The function expects a StructuralTest, but we pass it an object
// literal.
/**
 * @param {?} st
 * @return {?}
 */
function expectsAStructuralTest(st) { }
expectsAStructuralTest({ field1: 'hi', method: (/**
     * @return {?}
     */
    () => 'hi') });
