/**
 * @fileoverview Checks that JSDoc `@enum` tags on an `enum` are flagged as
 * warnings.
 * @suppress {uselessCode}
 */

/**
 * @enum
 */
enum A {
  A,
  B
}

/** @enum */
enum B {
  A,
  B
}

/**
 * @enum {number}
 */
enum C {
  A = 10,
  B = 20
}

class SomeComponent {
  /** @enum {number} */
  readonly MY_ENUM = {
    A: 10,
    B: 20,
  };
}
