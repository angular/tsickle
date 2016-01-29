class SuperTestBase {
  constructor(public x: number) {}
}

// A ctor with a parameter property.
class SuperTestDerivedParamProps extends SuperTestBase {
  constructor(public y: string) {
    super(3);
  }
}

// A ctor with an initialized property.
class SuperTestDerivedInitializedProps extends SuperTestBase {
  y: string = 'foo';
  constructor() {
    super(3);
  }
}

// A ctor with a super() but none of the above two details.
class SuperTestDerivedOrdinary extends SuperTestBase {
  constructor() {
    super(3);
  }
}
