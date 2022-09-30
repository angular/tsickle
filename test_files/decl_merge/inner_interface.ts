/**
 * @fileoverview Ensure interfaces nested in an outer class or interface,
 * defined with declaration merging are properly transformed and hoisted out of
 * the namespace, and no iife is created for the namespace.
 *
 * @suppress {uselessCode}
 */

export class OC {
  i: OC.I|null = null;
  constructor(private j: OC.J) {}
}

export interface OI {}

// tslint:disable-next-line:no-namespace
export namespace OC {
  /** Bla interface */
  export interface I {
    bar(e: OI.E): void;
  }
  export interface J extends OC.I {
    foo(i: OC.I): OC.J;
  }
}

// tslint:disable-next-line:no-namespace
export namespace OI {
  /** Bla enum */
  export enum E {a, b}
  export const C1 = 0, C2 = 'string const';
  /** Bla const */
  export const C3 = OI.E.a;
}

function f(j: OC.J) {
  return j.foo(j);
}

function g(): OI.E {
  return OI.E.a;
}