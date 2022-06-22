// test_files/import_by_path.no_externs/conflicting_multiple.ts(7,21): error TS0: referenced JavaScript module google3/path/to/multiple_provides/conflicting provides multiple namespaces and cannot be imported by path.
/**
 *
 * @fileoverview Negative test: this TS file attempts to import a JS module that
 * provides multiple conflicting namespaces by path, which is an error.
 * Generated from: test_files/import_by_path.no_externs/conflicting_multiple.ts
 * @suppress {checkTypes}
 *
 */
goog.module('test_files.import_by_path.no_externs.conflicting_multiple');
var module = module || { id: 'test_files/import_by_path.no_externs/conflicting_multiple.ts' };
goog.require('tslib');
const tsickle_conflicting_1 = goog.requireType("multiple.provides.conflicting.a");
const conflicting_1 = goog.require('multiple.provides.conflicting.a');
console.error(conflicting_1.value);
