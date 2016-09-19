Warning at test_files/declare_class_overloads/declare_class_overloads.ts:4:3: multiple constructor signatures in declarations
Warning at test_files/declare_class_overloads/declare_class_overloads.ts:10:3: multiple constructor signatures in declarations
Warning at test_files/declare_class_overloads/declare_class_overloads.ts:16:3: multiple constructor signatures in declarations
Warning at test_files/declare_class_overloads/declare_class_overloads.ts:23:3: multiple constructor signatures in declarations
Warning at test_files/declare_class_overloads/declare_class_overloads.ts:34:3: multiple constructor signatures in declarations
Warning at test_files/declare_class_overloads/declare_class_overloads.ts:39:3: multiple constructor signatures in declarations
====
// A class with an overloaded constructor where constructor args are optional.
declare class MultipleConstructorsOptional {
  constructor();
  constructor(a: number);
}

// A class with an overloaded constructor with different types for the same parameter name.
declare class MultipleConstructorsTypes { 
  constructor(a: boolean);
  constructor(a: number);
}

// A class with an overloaded constructor with different types and different param names.
declare class MultipleConstructorsNamesAndTypes { 
  constructor(a: boolean);
  constructor(b: number);
}

// A class with a mixed matrix of name and types.
declare class MultipleConstructorsComplexMatrix {
  constructor(a: number, b: number, c: number,
      normal?: string, color?: boolean, materialIndex?: number);
  constructor(a: number, b: number, c: number,
      normal?: string, vertexColors?: boolean[], materialIndex?: number);
  constructor(a: number, b: number, c: number,
      vertexNormals?: string[], color?: boolean, materialIndex?: number);
  constructor(a: number, b: number, c: number,
      vertexNormals?: string[], vertexColors?: boolean[], materialIndex?: number);
}

// A class with a variadic and explicit array constructor
declare class MultipleConstructorsVariadic {
  constructor(...a: number[]);
  constructor(a: number[]);
}

declare class MultipleConstructorsVariadicNames {
  constructor(points: string[]);
  constructor(points: number[]);
  constructor(...points: string[]);
  constructor(...points: number[]);
}

// Methods with a simple overload pattern. 
declare class OverloadSimpleArgs {
  o(a: string): void;
  o(a: string, b: boolean): void;
  o(a: string, b: boolean, c: number): void;
}

// Methods with name variants at the same ordinal parameter
declare class OverloadNameVariants {
  o(a: string): void;
  o(b: boolean): void;
  o(c: number): void;
}

// Methods that return diffent types, but never void.
declare class OverloadReturnTypesNoVoid {
  o(a: string, b: boolean): boolean;
  o(a: string, b: boolean, c: number): number;
}

// Methods that return diffent types, including void.
declare class OverloadReturnTypesWithVoid {
  o(a: string): void;
  o(a: string, b: boolean): boolean;
  o(a: string, b: boolean, c: number): number;
}

// A mix of types and names at the same indicies, and varying param counts (optional params)
declare class OverloadBigMix {
  o(a: string): void;
  o(a: string, b: number): number;
  o(c: number, b: number): number;
  o(e: Array<OverloadBigMix>) : boolean;
  o(...f: OverloadBigMix[]): number;
}
