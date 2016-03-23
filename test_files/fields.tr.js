class FieldsTest {
    /**
     * @param {number} field3
     */
    constructor(field3) {
        this.field3 = field3;
        this.field3 = 2 + 1;
    }
    /**
     */
    getF1() {
        // This access prints a warning without a generated field stub declaration.
        return this.field1;
    }
    static _sickle_typeAnnotationsHelper() {
        /** @type {string} */
        FieldsTest.prototype.field1;
        /** @type {number} */
        FieldsTest.prototype.field2;
        /** @type {number} */
        FieldsTest.prototype.field3;
    }
}
let fieldsTest = new FieldsTest(3);
// Ensure the type is understood by Closure.
fieldsTest.field1 = 'hi';
