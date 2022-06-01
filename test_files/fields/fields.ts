/**
 * @fileoverview
 * @suppress {uselessCode}
 */

class FieldsTest {
  field1: string;
  field2: number;

  constructor(private field3: number) {
    this.field1 = '1';
    this.field2 = 2;
    this.field3 = 2 + 1;
    /** @return an expression statement with some JSDoc */
    this.field5;
  }

  // A field without an explicit type declaration.
  field4 = 'string';

  /**
   * A field without an explicit type declaration and some JSDoc
   * @param some description
   */
  field5 = stringIdentity;

  getF1() {
    // This access prints a warning without a generated field stub declaration.
    return this.field1;
  }
}

function stringIdentity(x: string) {
  return x;
}

let fieldsTest = new FieldsTest(3);
// Ensure the type is understood by Closure.
fieldsTest.field1 = 'hi';

let AnonymousClass = class {
  field: number = 1;
};
