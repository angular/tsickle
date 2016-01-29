class SuperTestBase {
    constructor(x) {
        // Sickle: begin stub declarations.
        this.x = x;
        /** @type { number} */
        this.x;
        // Sickle: end stub declarations.
    }
}
// A ctor with a parameter property.
class SuperTestDerivedParamProps extends SuperTestBase {
    constructor(y) {
        super(3);
        this.y = y;
        // Sickle: begin stub declarations.
        /** @type { string} */
        this.y;
        // Sickle: end stub declarations.
    }
}
// A ctor with an initialized property.
class SuperTestDerivedInitializedProps extends SuperTestBase {
    constructor() {
        super(3);
        this.y = 'foo';
        // Sickle: begin stub declarations.
        /** @type { string} */
        this.y;
        // Sickle: end stub declarations.
    }
}
// A ctor with a super() but none of the above two details.
class SuperTestDerivedOrdinary extends SuperTestBase {
    constructor() {
        super(3);
        // Sickle: begin stub declarations.
        // Sickle: end stub declarations.
    }
}
