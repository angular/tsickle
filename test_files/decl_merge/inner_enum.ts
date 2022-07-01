/**
 * @fileoverview Ensure enums nested in a class, defined with declaration
 * merging are properly transformed and hoisted out of the namespace, and no
 * iife is created for the namespace.
 *
 * @suppress {uselessCode}
 */

export class Outer {
  e = Outer.Event.E_1;
  foo(): Outer.Event {
    return Outer.Event.E_0;
  }
}

// tslint:disable-next-line:no-namespace
export namespace Outer {
  export enum Event {E_0, E_1}
}

export function e0() {
  return Outer.Event.E_0;
}