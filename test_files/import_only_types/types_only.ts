/**
 * @fileoverview Exports only types, but must still be goog.require'd for
 * Closure Compiler.
 * @suppress {uselessCode}
 */

export interface Foo {
  x: string;
}

export type Bar = number;

/** A type that will be used within this file below. */
export type FnType = () => void;

/**
 * Uses exported types to demonstrate that the symbols can be resolved locally.
 */
function doThing(a: Foo, b: FnType) {}
