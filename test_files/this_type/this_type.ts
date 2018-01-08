export {};

class SomeClass {
  private x: number;
}

const variableWithFunctionTypeUsingThis: (this: SomeClass, a: string) => number = () => 1;

// Has only a single this arg, no more parameters.
function foo(): ((this: string) => string)|undefined {
  return undefined;
}
