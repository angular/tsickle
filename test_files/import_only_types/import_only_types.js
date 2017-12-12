/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
goog.module('test_files.import_only_types.import_only_types');
var module = module || { id: 'test_files/import_only_types/import_only_types.ts' };
const tsickle_forward_declare_1 = goog.forwardDeclare("test_files.import_only_types.types_only");
goog.require("test_files.import_only_types.types_only"); // force type-only module to be loaded
const tsickle_forward_declare_2 = goog.forwardDeclare("test_files.import_only_types.types_and_constenum");
goog.require("test_files.import_only_types.types_and_constenum"); // force type-only module to be loaded
/** @type {!tsickle_forward_declare_1.Foo} */
let x = { x: 'x' };
/** @type {!tsickle_forward_declare_2.SomeInterface} */
let y = x;
console.log(y);
