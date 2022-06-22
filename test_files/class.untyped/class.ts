/**
 * @fileoverview
 * @suppress {uselessCode}
 */

export {};

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

// It's also legal to alias a type and then implement the alias.
type TypeAlias = Interface;
class ImplementsTypeAlias implements TypeAlias, Super {
  interfaceFunc(): void {}
  superFunc(): void {}
}

// Verify Closure accepts the various casts.
let interfaceVar: Interface;
interfaceVar = new Implements();
interfaceVar = new Extends();
interfaceVar = new ImplementsTypeAlias();

let superVar: Super;
superVar = new Implements();
superVar = new Extends();
superVar = new ImplementsTypeAlias();

// Reproduce issue #333: type/value namespace collision.
// Because Zone is both a type and a value, the interface will be dropped
// when converting to Closure, so the "implements" should be ignored for
// both the direct use and the use via a typedef.
interface Zone {
  zone: string;
}
function Zone() {}
class ZoneImplementsInterface implements Zone {
  zone: string;
}
type ZoneAlias = Zone;
class ZoneImplementsAlias implements ZoneAlias {
  zone: string;
}

class WithOptionalField {
  optionalField?: string = 'a';
}
