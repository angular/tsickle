// test_files/import_by_path.no_externs/conflicting_multiple_bystar.ts(7,25): error TS0: referenced JavaScript module google3/path/to/multiple_provides/conflicting provides multiple namespaces and cannot be imported by path.
/**
 *
 * @fileoverview Negative test: import by star reports errors for conflicting
 * symbols.
 * Generated from: test_files/import_by_path.no_externs/conflicting_multiple_bystar.ts
 * @suppress {checkTypes}
 *
 */
goog.module('test_files.import_by_path.no_externs.conflicting_multiple_bystar');
var module = module || { id: 'test_files/import_by_path.no_externs/conflicting_multiple_bystar.ts' };
goog.require('tslib');
const tsickle_conflicting_1 = goog.requireType("multiple.provides.conflicting.a");
const prefix = goog.require('multiple.provides.conflicting.a');
console.log(prefix.value);
