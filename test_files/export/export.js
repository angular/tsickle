/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
goog.module('test_files.export.export');
var module = module || { id: 'test_files/export/export.ts' };
module = module;
exports = {};
var export_helper_1 = goog.require('test_files.export.export_helper');
exports.export2 = export_helper_1.export2;
exports.export5 = export_helper_1.export5;
exports.export4 = export_helper_1.export4;
const tsickle_forward_declare_1 = goog.forwardDeclare("test_files.export.export_helper");
/** @typedef {!tsickle_forward_declare_1.Bar} */
exports.Bar; // re-export typedef
/** @typedef {!tsickle_forward_declare_1.TypeDef} */
exports.RenamedTypeDef; // re-export typedef
/** @typedef {!tsickle_forward_declare_1.TypeDef} */
exports.TypeDef; // re-export typedef
/** @typedef {!tsickle_forward_declare_1.Interface} */
exports.Interface; // re-export typedef
/** @typedef {!tsickle_forward_declare_1.DeclaredType} */
exports.DeclaredType; // re-export typedef
/** @typedef {!tsickle_forward_declare_1.DeclaredInterface} */
exports.DeclaredInterface; // re-export typedef
/** @type {string} */
exports.export1 = 'wins';
var export_helper_2 = export_helper_1;
exports.export3 = export_helper_2.export4;
const tsickle_forward_declare_2 = goog.forwardDeclare("test_files.export.export_helper");
/** @typedef {!tsickle_forward_declare_2.Interface} */
exports.RenamedInterface; // re-export typedef
/** @type {number} */
exports.exportLocal = 3;
/** @type {number} */
let export2 = 3;
const tsickle_forward_declare_3 = goog.forwardDeclare("test_files.export.export_helper");
var type_and_value_1 = goog.require('test_files.export.type_and_value');
exports.TypeAndValue = type_and_value_1.TypeAndValue;
const tsickle_forward_declare_4 = goog.forwardDeclare("test_files.export.type_and_value");
const tsickle_forward_declare_5 = goog.forwardDeclare("test_files.export.export_helper_3");
goog.require("test_files.export.export_helper_3"); // force type-only module to be loaded
/**
 * @return {!tsickle_forward_declare_5.Foo}
 */
function createFoo() {
    return { fooStr: 'fooStr' };
}
exports.createFoo = createFoo;
/** @typedef {!tsickle_forward_declare_5.Foo} */
exports.Foo; // re-export typedef
