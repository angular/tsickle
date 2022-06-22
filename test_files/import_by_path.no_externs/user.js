/**
 *
 * @fileoverview Tests that tsickle emits goog namespace references when
 * importing modules by path.
 * Generated from: test_files/import_by_path.no_externs/user.ts
 * @suppress {checkTypes}
 *
 */
goog.module('test_files.import_by_path.no_externs.user');
var module = module || { id: 'test_files/import_by_path.no_externs/user.ts' };
goog.require('tslib');
const tsickle_otherfile_1 = goog.requireType("other.module");
const tsickle_typeonly_2 = goog.requireType("type.module");
const ns = goog.require('other.module');
const otherfile_1 = ns;
console.log((/** @type {number} */ ((0, otherfile_1.someFunction)(1))));
ns.someFunction(1);
