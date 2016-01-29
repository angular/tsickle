class ParamProps {
    // The @export below should not show up in the output ctor.
    constructor(bar, bar2) {
        // Sickle: begin stub declarations.
        this.bar = bar;
        this.bar2 = bar2;
        /**  @export @type { string} */
        this.bar;
        /** @type { string} */
        this.bar2;
        // Sickle: end stub declarations.
    }
}
