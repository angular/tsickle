/**
 * @fileoverview Decorated class, whose type and value are exported separately.
 * The value used afterwards.
 */

function classDecorator(t: any) {
  return t;
}

@classDecorator
class FooImpl {
}

export type Foo = FooImpl;
export const Foo = FooImpl;

console.log(Foo);
