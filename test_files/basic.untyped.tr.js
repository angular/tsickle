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
    }
    _sickle_typeAnnotationsHelper() {
        /** @type { ?} */
        this.field;
        /** @type { ?} */
        this.ctorArg;
    }
}
