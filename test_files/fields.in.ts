class Klass {
  field1: string;
  field2: number;

  constructor(private field3: number) {
    this.field3 = 2 + 1;
  }

  getF1() {
    // This access print a warning without a generated field stub declaration.
    return this.field1;
  }
}
