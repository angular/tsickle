class Klass {
    constructor(field3) {
        // Sickle: begin stub declarations.
        this.field3 = field3;
        /** @type { string} */
        this.field1;
        /** @type { number} */
        this.field2;
        /** @type { number} */
        this.field3;
        // Sickle: end stub declarations.
        this.field3 = 2 + 1;
    }
    getF1() {
        // This access print a warning without a generated field stub declaration.
        return this.field1;
    }
}
