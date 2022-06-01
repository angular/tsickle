/**
 * @fileoverview Tests `readonly` properties are annotated with `@const`.
 * @suppress {uselessCode}
 */

export class Class {
  static readonly staticProp: string = '';
  readonly normalProp: string;

  constructor(readonly paramProp: string) {
    this.normalProp = '';
  }
}

export interface ExportedInterface {
  readonly prop: string;

  // Index signatures aren't supported, yet.
  readonly [key: string]: string|undefined;
}

declare interface DeclaredInterface {
  readonly prop: string;
}

// A type alias is a typedef in closure, which does not support @const.
export type TypeAlias = {
  readonly prop: string;
};

// A readonly array is special. It's translated to the `ReadonlyArray`, which
// doesn't have any mutation methods. `Readonly` array is part of the default
// closure externs, see
// https://github.com/google/closure-compiler/blob/f84c81bbfcfb1a3ba8b9fd9e04e514c5aa7f08e1/externs/es3.js#L643
export let readonlyArray: readonly number[] = [1, 2, 3];
