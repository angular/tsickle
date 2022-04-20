/**
 * @fileoverview Test to ensure that only one assignment to
 * `exports.A` is emitted when A is a namespace with merged declarations.
 * Tsickle eliminates the second assignment.
 */

// Ensure that the merged namespace is only assigned to exports.A once
// in the JS output.
class A {}
namespace A {
  export class B {};
}
export {A};

// Ensure that the export of a namespace without a merged class does
// not get eliminated.
namespace X {
  export class B {};
}
export {X};
