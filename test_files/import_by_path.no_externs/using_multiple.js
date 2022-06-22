/**
 *
 * @fileoverview Using a namespace that provides multiple, nested symbols.
 * Generated from: test_files/import_by_path.no_externs/using_multiple.ts
 * @suppress {checkTypes}
 *
 */
goog.module('test_files.import_by_path.no_externs.using_multiple');
var module = module || { id: 'test_files/import_by_path.no_externs/using_multiple.ts' };
goog.require('tslib');
const tsickle_nesting_1 = goog.requireType("multiple.provides.Nesting");
const nesting_1 = goog.require('multiple.provides.Nesting');
console.error(new nesting_1());
console.error(new nesting_1.Inner());
