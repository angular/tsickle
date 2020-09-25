/**
 * @fileoverview Implementations for the code described by clutz_input.d.ts.
 *
 * These exist to satisfy the E2E Closure Compilation test case. They use 
 * goog.provide over goog.module for the convenience of a single file (it should
 * not make a difference for the test).
 */

goog.provide('my.module');
goog.provide('other.module');
goog.provide('type.module');
goog.provide('multiple.provides.Nesting');
goog.provide('multiple.provides.Nesting.Inner');
goog.provide('multiple.provides.conflicting.a');
goog.provide('multiple.provides.conflicting.b');

my.module = class {
  constructor() {
    /** @type {number} */
    this.someFunction;
  }
}

/**
 * @param {number} x
 * @return {number}
 */
other.module.someFunction = function(x) { return x; }

/** @type {number} */
type.module.SomeType;

/** @const */
multiple.provides.Nesting = class {};
/** @const */
multiple.provides.Nesting.Inner = class {};

/** @const */
multiple.provides.conflicting.a.value = 1;
/** @const */
multiple.provides.conflicting.b.value2 = 2;
