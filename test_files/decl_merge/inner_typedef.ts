/**
 * @fileoverview Ensure that a type alias declared in a declaration
 * merging namespace is generated as a property of the merged outer class.
 *
 * @suppress {uselessCode,checkTypes}
 */

export class A {
  foo(f: A.F): A.X { return f(''); }
}

// tslint:disable-next-line:no-namespace
export namespace A {
  export type F = (a: string) => X;
  export class X { }
}

let cb: A.F;
