class ParamProps {
    // The @export below should not show up in the output ctor.
    constructor(bar, bar2) {
        this.bar = bar;
        this.bar2 = bar2;
    }
    _sickle_typeAnnotationsHelper() {
        /** @export
       @type { string} */
        this.bar;
        /** @type { string} */
        this.bar2;
    }
}
