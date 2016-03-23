/**
 * @param {?} arg1
 * @return {?}
 */
function func(arg1) {
    return [3];
}
class Foo {
    /**
     * @param {?} ctorArg
     */
    constructor(ctorArg) {
        this.ctorArg = ctorArg;
        this.field = 'hello';
    }
    static _sickle_typeAnnotationsHelper() {
        /** @type {?} */
        Foo.prototype.field;
        /** @type {?} */
        Foo.prototype.ctorArg;
    }
}
