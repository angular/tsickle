/**
 * @fileoverview This test exercises the various ways classes and interfaces can
 * interact. There are three types of classy things: interface, class, abstract
 * class And there are two keywords for relating them: extends, implements You
 * can legally use them in almost any configuration the cross product implies;
 * for example, you can "implements" a class though it's more rare than the
 * other options.
 * @suppress {uselessCode}
 * @suppress {dangerousUnrecognizedTypeError}
 */


export {};

// Three declarations, one for each type of thing.
interface Interface {
  interfaceFunc(): void;
}
class Class {
  classFunc(): void {}
}
abstract class AbstractClass {
  abstract abstractFunc(): void;
  nonAbstractFunc(): void {}
}

// Write out all permutations:
// 1) interface implements
// 2) interface extends
// 3) class implements
// 4) class extends
// 5) abstract class implements
// 6) abstract class extends

// Permutation 1: interface implements.
// "interface implements" is not legal TypeScript, so no examples necessary.

// Permutation 2: interface extends.
interface InterfaceExtendsInterface extends Interface {
  interfaceFunc2(): void;
}

let interfaceExtendsInterface:
    InterfaceExtendsInterface = {interfaceFunc() {}, interfaceFunc2() {}};

// Permutation 2: interface extends class.
interface InterfaceExtendsClass extends Class {
  interfaceFunc3(): void;
}

// Permutation 3: class implements.
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

// Permutation 4: class extends.
// Note: cannot "extends" an interface.
// So this is illegal: class ClassExtendsInterface extends Interface {
class ClassExtendsClass extends Class {
  classFunc(): void {}
}
class ClassExtendsAbstractClass extends AbstractClass {
  abstractFunc(): void {}
}

// Permutation 5: abstract class implements.
abstract class AbstractClassImplementsInterface implements Interface {
  interfaceFunc(): void {}
}
abstract class AbstractClassImplementsClass implements Class {
  classFunc(): void {}
}
abstract class AbstractClassImplementsAbstractClass implements AbstractClass {
  // Note: because this class *implements* AbstractClass, it must also implement
  // abstractFunc and nonAbstractFunc despite that already having an
  // implementation.
  abstractFunc(): void {}
  nonAbstractFunc(): void {}
}

// Permutation 6: abstract class extends.
// Note: cannot "extends" an interface.
// So this is illegal: class AbstractClassExtendsInterface extends Interface {
abstract class AbstractClassExtendsClass extends Class {
  classFunc(): void {}
}
abstract class AbstractClassExtendsAbstractClass extends AbstractClass {
  // Note: can leave out abstractFunc() because this class is still abstract.
}

// It's also legal to alias a type and then implement the alias.
type TypeAlias = Interface;
class ImplementsTypeAlias implements TypeAlias, Class {
  interfaceFunc(): void {}
  classFunc(): void {}
}

// Verify Closure accepts the various subtypes of Interface.
let interfaceVar: Interface;
interfaceVar = interfaceExtendsInterface;
interfaceVar = new ClassImplementsInterface();
interfaceVar = new ImplementsTypeAlias();

// Verify Closure accepts the various subtypes of Class.
let classVar: Class;
classVar = new ClassImplementsClass();
classVar = new ClassExtendsClass();
classVar = new ImplementsTypeAlias();

// Verify Closure accepts the various subtypes of AbstractClass.
let abstractClassVar: AbstractClass;
abstractClassVar = new ClassImplementsAbstractClass();
abstractClassVar = new ClassExtendsAbstractClass();

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

// TODO: b/280605173 - JS cannot compile the output. Suppressed
// dangerousUnrecognizedTypeError to get this to pass the test.
function classMaker(base: number) {
  return class ScopedClass {
    constructor(readonly otherBase: number) {}

    normalize(val: number): number {
      return base + this.otherBase + val;
    }
  };
}
