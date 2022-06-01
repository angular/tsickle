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
(function (A) {
    class B {
    }
    A.B = B;
    ;
})(A || (A = {}));
// Ensure that the export of a namespace without a merged class does
// not get eliminated.
var X;
(function (X) {
    class B {
    }
    X.B = B;
    ;
})(X || (X = {}));
exports.X = X;
