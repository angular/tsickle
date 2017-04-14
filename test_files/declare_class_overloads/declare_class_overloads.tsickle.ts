/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes}
 */


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
  overloaded(a: string): void;
  overloaded(a: number, b: boolean): void;
  overloaded(a: string, b: boolean, c: number): void;
  overloaded(a: string, b: boolean, c: number, ...d: any[]): void;
}


// Methods with name variants at the same ordinal parameter
declare class OverloadNameVariants {
  overloaded(a: string): void;
  overloaded(b: boolean): void;
  overloaded(c: number): void;
}

// Methods that return diffent types, but never void.
declare class OverloadReturnTypesNoVoid {
  overloaded(a: string, b: boolean): boolean;
  overloaded(a: string, b: boolean, c: number): number;
}

// Methods that return diffent types, including void.
declare class OverloadReturnTypesWithVoid {
  overloaded(a: string): void;
  overloaded(a: string, b: boolean): boolean;
  overloaded(a: string, b: boolean, c: number): number;
}

// A mix of types and names at the same indicies, and varying param counts (optional params)
declare class OverloadBigMix {
  overloaded(a: string): void;
  overloaded(a: string, b: number): number;
  overloaded(c: number, b: number): number;
  overloaded(e: Array<OverloadBigMix>): boolean;
  // Note: Closure doesn't allow rest params when they aren't the final
  // param to the function, and the earlier overloads declare a second parameter.
  // Not sure what to do with this function; perhaps just declare it as
  // just a param of {...?}.  For now, just leave it out.
  // overloaded(...f: OverloadBigMix[]): number;
}

// Use a builtin JS name.
declare class OverloadValueOf {
  valueOf(): string;
}

declare class Merged {
  overloaded(
      a_or_c_or_e_or_f: string|number|Array<OverloadBigMix>|OverloadBigMix[],
      opt_b: number) : void|number|boolean;
  variadic(...test: number[]): void;
}

declare class OverloadTypeArgs {
  typeArged<T>(a: number, b: T): T;
  typeArged<T, U>(a: T, b: U): U;
}
