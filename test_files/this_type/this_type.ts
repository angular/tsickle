export {};

class SomeClass {
  private x: number;
}

const variableWithFunctionTypeUsingThis: (this: SomeClass, a: string) => number = () => 1;
