// Ensure that a class is structurally equivalent to an object literal
// with the same fields.
class StructuralTest {
    /**
     * @return {?}
     */
    method() { return this.field1; }
    static _sickle_typeAnnotationsHelper() {
        /** @type {?} */
        StructuralTest.prototype.field1;
    }
}
/**
 * @param {?} st
 */
function expectsAStructuralTest(st) { }
expectsAStructuralTest({ field1: 'hi', method: () => 'hi' });
