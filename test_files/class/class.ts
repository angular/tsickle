// This test exercises the various ways classes and interfaces can interact.
// There are three types of classy things:
//   interface, class, abstract class
// And there are two keywords for relating them:
//   extends, implements
// You can legally use them in almost any configuration the cross product implies;
// for example, you can "implements" a class though it's more rare than the
// other options.

// Three declarations, one for each type of thing.
interface Interface {
  interfaceFunc(): void;
}
class Class {
  classFunc(): void {}
}
abstract class AbstractClass {
  abstract abstractFunc(): void;
  nonAbstractFunc(): void { }
}

// Write out all permutations:
// 1) interface implements
// 2) interface extends
// 3) class implements
// 4) class extends

// 1) interface implements.
// No examples; this is not legal TypeScript.

// 2) interface extends.
interface InterfaceExtendsInterface extends Interface {
  interfaceFunc2(): void;
}
let interfaceExtendsInterfaceValue = {} as InterfaceExtendsInterface;
interface InterfaceExtendsClass extends Class {
  interfaceFunc2(): void;
}
let interfaceExtendsClassValue: InterfaceExtendsClass = {} as InterfaceExtendsClass;
interface InterfaceExtendsAbstractClass extends AbstractClass {
  interfaceFunc2(): void;
}
let interfaceExtendsAbstractClassValue: InterfaceExtendsAbstractClass = {} as any;

// 3) class implements.
class ClassImplementsInterface implements Interface {
  interfaceFunc(): void {}
}
class ClassImplementsClass implements Class {
  classFunc(): void {}
}
class ClassImplementsAbstractClass implements AbstractClass {
  abstractFunc(): void {}
  // Note: because this class *implements* AbstractClass, it must also implement
  // nonAbstractFunc despite that already having an implementation.
  nonAbstractFunc(): void {}
}

// 4) class extends.
// Note: cannot "extends" an interface.
//    class ClassExtendsInterface extends Interface {
class ClassExtendsClass extends Class {
  classFunc(): void {}
}
class ClassExtendsAbstractClass extends AbstractClass {
  abstractFunc(): void {}
}



// It's also legal to alias a type and then implement the alias.
type TypeAlias = Interface;
class ImplementsTypeAlias implements TypeAlias, Class {
  interfaceFunc(): void {}
  classFunc(): void {}
}

// Verify Closure accepts the various subtypes of Interface.
let interfaceVar: Interface;
interfaceVar = interfaceExtendsInterfaceValue;
interfaceVar = new ClassImplementsInterface();
interfaceVar = new ImplementsTypeAlias();

// Verify Closure accepts the various subtypes of Class.
let classVar: Class;
classVar = interfaceExtendsClassValue;
classVar = new ClassImplementsClass();
classVar = new ClassExtendsClass();
classVar = new ImplementsTypeAlias();

// Verify Closure accepts the various subtypes of AbstractClass.
let abstractClassVar: AbstractClass;
abstractClassVar = interfaceExtendsAbstractClass;
abstractClassVar = new ClassImplementsAbstractClass();
abstractClassVar = new ClassExtendsAbstractClass();

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