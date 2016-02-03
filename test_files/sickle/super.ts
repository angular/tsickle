class SuperTestBaseNoArg {
  constructor() {

// Sickle: begin stub declarations.

// Sickle: end stub declarations.
}
}

class SuperTestBaseOneArg {
  constructor(public x: number) {

// Sickle: begin stub declarations.

 /** @type { number} */
this.x;
// Sickle: end stub declarations.
}
}

// A ctor with a parameter property.
class SuperTestDerivedParamProps extends SuperTestBaseOneArg {
  constructor(public y: string) {
    super(3);

// Sickle: begin stub declarations.

 /** @type { string} */
this.y;
// Sickle: end stub declarations.

  }
}

// A ctor with an initialized property.
class SuperTestDerivedInitializedProps extends SuperTestBaseOneArg {
  y: string = 'foo';
  constructor() {
    super(3);

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
  // NOTE: if this has any properties, we fail to generate it
  // properly because we generate a constructor that doesn't know
  // how to properly call the parent class's super().
}

interface SuperTestInterface {
  foo: number;
}

// A class implementing an interface.
class SuperTestDerivedInterface implements SuperTestInterface {
  foo: number;
// Sickle: begin synthetic ctor.
constructor() {


// Sickle: begin stub declarations.

 /** @type { number} */
this.foo;
// Sickle: end stub declarations.
}

}
