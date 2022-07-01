/**
 * @fileoverview Ensure inner classes defined with declaration merging
 *   are properly transformed and hoisted out of the namespace, and
 *   no iife is created for the namespace.
 */

export class SomeClass {}

// tslint:disable-next-line:no-namespace
export namespace SomeClass {
  export class Inner {}
}

let x: SomeClass.Inner;
