/**
 *
 * @fileoverview Tests that tsickle emits goog namespace references when importing modules by path,
 * and handles named to default export conversion.
 *
 * Generated from: test_files/import_by_path.no_externs/user_default.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.import_by_path.no_externs.user_default');
var module = module || { id: 'test_files/import_by_path.no_externs/user_default.ts' };
goog.require('tslib');
const tsickle_file_1 = goog.requireType("my.module");
const file_1 = goog.require('my.module');
console.log(new file_1().someField);
