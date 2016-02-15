class Klass {
  field1: string;
  field2: number;

  constructor(private field3: number) {
    this.field3 = 2 + 1;

// Sickle: begin stub declarations.

 /** @type { string} */
this.field1;
 /** @type { number} */
this.field2;
 /** @type { number} */
this.field3;
// Sickle: end stub declarations.

  }

  getF1() {
    // This access print a warning without a generated field stub declaration.
    return this.field1;
  }
}
