interface Interface {
  interfaceFunc(): void;
}

class Super {
  superFunc(): void {}
}

class Implements implements Interface, Super {
  interfaceFunc(): void {}
  superFunc(): void {}
}

class Extends extends Super implements Interface {
  interfaceFunc(): void {}
}

// Verify Closure accepts the various casts.
let interfaceVar: Interface;
interfaceVar = new Implements();
interfaceVar = new Extends();

let superVar: Super;
superVar = new Implements();
superVar = new Extends();

