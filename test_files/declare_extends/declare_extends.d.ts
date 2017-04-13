
declare class Parent { x: number; }
declare class Child extends Parent { y: number; }

declare interface ParentInterface { foo(): void; }
declare interface ChildInterface extends ParentInterface { bar(): void; }

declare class ImplementingClass implements ParentInterface { foo(): void; }
