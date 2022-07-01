/**
 * @fileoverview Test to ensure that only one assignment to
 * `exports.A` is emitted when A is a namespace with merged declarations.
 * Tsickle eliminates the second assignment.
 * @suppress {checkTypes}
 */

// Ensure that the merged namespace is only assigned to exports.A once
// in the JS output.
class A {}
namespace A {
  export class B {};
}
export {A};
