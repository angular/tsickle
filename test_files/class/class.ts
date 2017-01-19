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

// Reproduce issue #333: type/value namespace collision.
// Because Zone is both a type and a value, the interface will be dropped
// when converting to Closure, so the "implements" should be ignored.
interface Zone { zone: string; }
const Zone = (function(global: any) {
  class Zone2 implements Zone {
    zone: string;
  }
});
