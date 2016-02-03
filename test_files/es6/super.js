class SuperTestBaseNoArg {
    constructor() {
        // Sickle: begin stub declarations.
        // Sickle: end stub declarations.
    }
}
class SuperTestBaseOneArg {
    constructor(x) {
        // Sickle: begin stub declarations.
        this.x = x;
        /** @type { number} */
        this.x;
        // Sickle: end stub declarations.
    }
}
// A ctor with a parameter property.
class SuperTestDerivedParamProps extends SuperTestBaseOneArg {
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
class SuperTestDerivedInitializedProps extends SuperTestBaseOneArg {
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
class SuperTestDerivedOrdinary extends SuperTestBaseOneArg {
    constructor() {
        super(3);
        // Sickle: begin stub declarations.
        // Sickle: end stub declarations.
    }
}
// A class without a ctor, extending a one-arg ctor parent.
class SuperTestDerivedNoCTorNoArg extends SuperTestBaseNoArg {
}
// A class without a ctor, extending a no-arg ctor parent.
class SuperTestDerivedNoCTorOneArg extends SuperTestBaseOneArg {
}
// A class implementing an interface.
class SuperTestDerivedInterface {
    // Sickle: begin synthetic ctor.
    constructor() {
        // Sickle: begin stub declarations.
        /** @type { number} */
        this.foo;
        // Sickle: end stub declarations.
    }
}
