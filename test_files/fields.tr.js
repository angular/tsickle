class FieldsTest {
    constructor(field3) {
        this.field3 = field3;
        this.field3 = 2 + 1;
    }
    getF1() {
        // This access prints a warning without a generated field stub declaration.
        return this.field1;
    }
    _sickle_typeAnnotationsHelper() {
        /** @type { string} */
        this.field1;
        /** @type { number} */
        this.field2;
        /** @type { number} */
        this.field3;
    }
}
let fieldsTest = new FieldsTest(3);
// Ensure the type is understood by Closure.
fieldsTest.field1 = 'hi';
