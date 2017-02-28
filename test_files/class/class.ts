// This test exercises the various ways classes and interfaces can interact.
// There are three types of classy things:
//   interface, class, abstract class
// And there are two keywords for relating them:
//   extends, implements
// You can legally use them in any configuration the cross product implies;
// for example, you can "implements" a class though it's more rare than the
// other options.

// Three declarations, one for each type of thing.
interface Interface {
  interfaceFunc(): void;
}
class Class {
  superFunc(): void {}
}
abstract class AbstractClass {
  abstract abstractFunc(): void;
  nonAbstractFunc(): void { }
}

// This tests "implements" against an interface and the class.
class Implements implements Interface, Class {
  interfaceFunc(): void {}
  superFunc(): void {}
}

// This tests "implements" against an abstract class.
// Note: in Closure you cannot currently "implements" two classes, see #410.
class ImplementsAbstract implements AbstractClass {
  abstractFunc(): void {}
  // Note: because this class *implements* AbstractClass, it must also implement
  // nonAbstractFunc despite that already having an implementation.
  nonAbstractFunc(): void {}
}

// This tests "extends" against the class.
class Extends extends Class implements Interface {
  interfaceFunc(): void {}
}

// This tests "extends" against the abstract class.
class ExtendsAbstract extends AbstractClass {
  abstractFunc(): void {}
}

// It's also legal to alias a type and then implement the alias.
type TypeAlias = Interface;
class ImplementsTypeAlias implements TypeAlias, Class {
  interfaceFunc(): void {}
  superFunc(): void {}
}

// Verify Closure accepts the various casts.
let interfaceVar: Interface;
interfaceVar = new Implements();
interfaceVar = new Extends();
interfaceVar = new ImplementsTypeAlias();

let superVar: Class;
superVar = new Implements();
superVar = new Extends();
superVar = new ImplementsTypeAlias();

// Reproduce issue #333: type/value namespace collision.
// Because Zone is both a type and a value, the interface will be dropped
// when converting to Closure, so the "implements" should be ignored for
// both the direct use and the use via a typedef.
interface Zone { zone: string; }
function Zone() {}
class ZoneImplementsInterface implements Zone {
  zone: string;
}
type ZoneAlias = Zone;
class ZoneImplementsAlias implements ZoneAlias {
  zone: string;
}