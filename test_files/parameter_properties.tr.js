class ParamProps {
    // The @export below should not show up in the output ctor.
    constructor(bar, bar2) {
        this.bar = bar;
        this.bar2 = bar2;
    }
    static _sickle_typeAnnotationsHelper() {
        /** @export
       @type { string} */
        ParamProps.prototype.bar;
        /** @type { string} */
        ParamProps.prototype.bar2;
    }
}
