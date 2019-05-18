
declare class Parent { x: number; }
declare class Child extends Parent { y: number; }

declare interface ParentInterface { foo(): void; }
declare interface ChildInterface extends ParentInterface { bar(): void; }

declare class ImplementingClass implements ParentInterface { foo(): void; }

declare namespace foo {
  class NamespacedParent { x: number; }
  class NamespacedChildSameNamespace extends NamespacedParent { y: number; }
}

declare namespace bar {
  class NamespacedChild extends foo.NamespacedParent { y: number; }
}
