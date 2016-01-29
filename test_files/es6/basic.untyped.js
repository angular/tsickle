/** @return { ?} */ // This test is just a random collection of typed code, to
// ensure the output is all with {?} annotations.
function func(/** ? */ arg1) {
    return [3];
}
class Foo {
    constructor(ctorArg) {
        this.ctorArg = ctorArg;
        this.field = 'hello';
        // Sickle: begin stub declarations.
        /** @type { ?} */
        this.field;
        /** @type { ?} */
        this.ctorArg;
        // Sickle: end stub declarations.
    }
}
