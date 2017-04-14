/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes}
 */



class StructuralTest {
  field1: string;
/**
 * @return {?}
 */
method(): string { return this.field1; }
}

function StructuralTest_tsickle_Closure_declarations() {
/** @type {?} */
StructuralTest.prototype.field1;
}

/**
 * @param {?} st
 * @return {?}
 */
function expectsAStructuralTest(st: StructuralTest) {}
expectsAStructuralTest({field1: 'hi', method: () => 'hi'});
