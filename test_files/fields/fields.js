// Warning at test_files/fields/fields.ts:22:5: unhandled anonymous type
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
goog.module('test_files.fields.fields');var module = module || {id: 'test_files/fields/fields.js'};class FieldsTest {
    /**
     * @param {number} field3
     */
    constructor(field3) {
        this.field3 = field3;
        // A field without an explicit type declaration.
        this.field4 = 'string';
        this.field3 = 2 + 1;
    }
    /**
     * @return {string}
     */
    getF1() {
        // This access prints a warning without a generated field stub declaration.
        return this.field1;
    }
}
function FieldsTest_tsickle_Closure_declarations() {
    /** @type {string} */
    FieldsTest.prototype.field1;
    /** @type {number} */
    FieldsTest.prototype.field2;
    /** @type {string} */
    FieldsTest.prototype.field4;
    /** @type {number} */
    FieldsTest.prototype.field3;
}
let /** @type {!FieldsTest} */ fieldsTest = new FieldsTest(3);
// Ensure the type is understood by Closure.
fieldsTest.field1 = 'hi';
let AnonymousClass = class {
};
class BaseThatThrows {
    /**
     * @return {number}
     */
    get throwMe() { throw new Error(); }
}
class Derived extends BaseThatThrows {
}
function Derived_tsickle_Closure_declarations() {
    /**
     * Note: in Closure, this type is declared via an annotation on
     * Derived.prototype.throwMe, which throws if it's evaluated.
     * So any tsickle output that puts the type declaration at the
     * top level is wrong.
     * @type {number}
     */
    Derived.prototype.throwMe;
}
