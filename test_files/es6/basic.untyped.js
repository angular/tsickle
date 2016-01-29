/** @return { ?} */ // This test is just a random collection of typed code, to
// ensure the output is all with {?} annotations.
function func(/** ? */ arg1) {
    return [3];
}
class Foo {
    constructor(ctorArg) {
        // Sickle: begin stub declarations.
        this.ctorArg = ctorArg;
        /** @type { ?} */
        this.field;
        /** @type { ?} */
        this.ctorArg;
        // Sickle: end stub declarations.
        this.field = 'hello';
    }
}
