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

class WithOptionalField {
  optionalField?: string = 'a';
}
