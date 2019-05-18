/**
 * @fileoverview An example of how to shim an external namespace declared in a .d.ts that's an ES6
 * module.
 */

goog.module('test_files.export_equals.shim.namespace');

// Assign the external namespace. "SomeNamespace" is assumed to be loaded separately, e.g. through a
// script tag or so.
exports = window['SomeNamespace'];
