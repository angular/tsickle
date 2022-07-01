/**
 *
 * @fileoverview Test to ensure that only one assignment to
 * `exports.A` is emitted when A is a namespace with merged declarations.
 * Tsickle eliminates the second assignment.
 * Generated from: test_files/export_merged/main.ts
 * @suppress {checkTypes}
 *
 */
goog.module('test_files.export_merged.main');
var module = module || { id: 'test_files/export_merged/main.ts' };
goog.require('tslib');
// Ensure that the merged namespace is only assigned to exports.A once
// in the JS output.
class A {
}
exports.A = A;
class A$B {
}
/** @const */
A.B = A$B;
