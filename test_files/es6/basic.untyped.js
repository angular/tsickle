/**
 * @param { ?} arg1
 * @return { ?}
 */
function func(arg1) {
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
