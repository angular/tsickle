/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.import_only_types.import_only_types');
var module = module || { id: 'test_files/import_only_types/import_only_types.ts' };
module = module;
exports = {};
const tsickle_forward_declare_1 = goog.requireType("test_files.import_only_types.types_only");
const tsickle_forward_declare_2 = goog.requireType("test_files.import_only_types.types_and_constenum");
/** @type {!tsickle_forward_declare_1.Foo} */
let x = { x: 'x' };
/** @type {!tsickle_forward_declare_2.SomeInterface} */
let y = x;
console.log(y);
