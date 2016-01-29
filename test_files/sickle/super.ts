class SuperTestBase {
  constructor(public x: number) {

// Sickle: begin stub declarations.

 /** @type { number} */
this.x;
// Sickle: end stub declarations.
}
}

// A ctor with a parameter property.
class SuperTestDerivedParamProps extends SuperTestBase {
  constructor(public y: string) {
    super(3);

// Sickle: begin stub declarations.

 /** @type { string} */
this.y;
// Sickle: end stub declarations.

  }
}

// A ctor with an initialized property.
class SuperTestDerivedInitializedProps extends SuperTestBase {
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
class SuperTestDerivedOrdinary extends SuperTestBase {
  constructor() {
    super(3);

// Sickle: begin stub declarations.

// Sickle: end stub declarations.

  }
}
