/**
 * @fileoverview Test devmode (i.e. no JSDoc or special enum transformer) emit
 * for enun merged with namespace.
 */

export enum E {
  e0 = 0,
  e1,
  e2
}

export namespace E {
  export function fromString(s: string) {
    return E.e0;
  }
}
