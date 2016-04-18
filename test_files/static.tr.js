class Static {
    static _sickle_typeAnnotationsHelper() {
        /** @type {?} */
        Static.bar;
        /** @type {number} */
        Static.baz;
    }
}
// This should not become a stub declaration.
Static.bar = 3;
Static.baz = 3;
