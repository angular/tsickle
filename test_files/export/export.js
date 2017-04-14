goog.module('test_files.export.export');var module = module || {id: 'test_files/export/export.js'};/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes}
 */

var export_helper_1 = goog.require('test_files.export.export_helper');
exports.export2 = export_helper_1.export2;
exports.Bar = export_helper_1.Bar;
exports.export5 = export_helper_1.export5;
exports.export4 = export_helper_1.export4;
exports.Interface = export_helper_1.Interface;
const tsickle_forward_declare_1 = goog.forwardDeclare('test_files.export.export_helper');
/** @typedef {tsickle_forward_declare_1.TypeDef} */
exports.RenamedTypeDef; // re-export typedef
/** @typedef {tsickle_forward_declare_1.TypeDef} */
exports.TypeDef; // re-export typedef
const tsickle_forward_declare_2 = goog.forwardDeclare('test_files.export.export_helper_2');
// These conflict with an export discovered via the above exports,
// so the above export's versions should not show up.
exports.export1 = 'wins';
var export_helper_2 = export_helper_1;
exports.export3 = export_helper_2.export4;
const tsickle_forward_declare_3 = goog.forwardDeclare('test_files.export.export_helper');
// This local should be fine to export.
exports.exportLocal = 3;
// The existence of a local should not prevent "export2" from making
// it to the exports list.  export2 should only show up once in the
// above two "export *" lines, though.
let /** @type {number} */ export2 = 3;
const tsickle_forward_declare_4 = goog.forwardDeclare('test_files.export.export_helper');
var type_and_value_1 = goog.require('test_files.export.type_and_value');
exports.TypeAndValue = type_and_value_1.TypeAndValue;
const tsickle_forward_declare_5 = goog.forwardDeclare('test_files.export.type_and_value');
