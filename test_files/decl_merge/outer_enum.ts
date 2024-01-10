/**
 * @fileoverview Ensure that a function declared in a declaration
 * merging namespace is generated as a property of the merged outer enum.
 *
 * @suppress {uselessCode,checkTypes}
 */

export enum E {
  a = 42,
  b
}

// tslint:disable-next-line:no-namespace
export namespace E {
  export function fromString(s: string) {
    return s === 'a' ? E.a : E.b;
  };
}

const e = E.fromString('a');
