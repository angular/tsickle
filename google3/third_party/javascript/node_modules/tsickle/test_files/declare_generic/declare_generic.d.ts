/** @fileoverview Tests use of generic types in .d.ts files. */

declare class WithGeneric<T, U> {
  useGenericType(t: T): U;
}

declare function genericFn<T>(): T;
