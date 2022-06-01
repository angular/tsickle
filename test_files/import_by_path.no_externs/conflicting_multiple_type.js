// test_files/import_by_path.no_externs/conflicting_multiple_type.ts(7,25): error TS0: referenced JavaScript module google3/path/to/multiple_provides/conflicting provides multiple namespaces and cannot be imported by path.
/**
 *
 * @fileoverview Negative test: import type reports errors for conflicting
 * symbols.
 * Generated from: test_files/import_by_path.no_externs/conflicting_multiple_type.ts
 * @suppress {checkTypes}
 *
 */
goog.module('test_files.import_by_path.no_externs.conflicting_multiple_type');
var module = module || { id: 'test_files/import_by_path.no_externs/conflicting_multiple_type.ts' };
goog.require('tslib');
const tsickle_conflicting_1 = goog.requireType("multiple.provides.conflicting.a");
/** @type {!tsickle_conflicting_1.Type} */
const z = {
    x: 1
};
console.log(z);
