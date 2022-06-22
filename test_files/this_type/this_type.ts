/**
 * @fileoverview
 * @suppress {checkTypes,uselessCode}
 */

export {};

class SomeClass {
  private x: number;
}

const variableWithFunctionTypeUsingThis: (this: SomeClass, a: string) =>
    number = () => 1;

// Has only a single this arg, no more parameters.
function foo(): ((this: string) => string)|undefined {
  return undefined;
}

class UnrelatedType {}
class ThisThisReturnsThisAsThis {
  // This (!) reproduces a situtation where tsickle would erroneously produce
  // an @THIS tag for the explicitly passed this type, plus one for the
  // template'd this type, which is an error in Closure.
  thisThisReturnsThisAsThis(this: UnrelatedType): this {
    return this as this;
  }
}
