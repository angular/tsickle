class FieldsTest {
  field1: string;
  field2: number;

  constructor(private field3: number) {
    this.field3 = 2 + 1;
  }

  // A field without an explicit type declaration.
  field4 = 'string';

  getF1() {
    // This access prints a warning without a generated field stub declaration.
    return this.field1;
  }
}

let fieldsTest = new FieldsTest(3);
// Ensure the type is understood by Closure.
fieldsTest.field1 = 'hi';

let AnonymousClass = class {
  field: number;
};


class BaseThatThrows {
  get throwMe(): number { throw new Error(); }
}
class Derived extends BaseThatThrows {
  /**
   * Note: in Closure, this type is declared via an annotation on
   * Derived.prototype.throwMe, which throws if it's evaluated.
   * So any tsickle output that puts the type declaration at the
   * top level is wrong.
   */
  throwMe: number;
}
