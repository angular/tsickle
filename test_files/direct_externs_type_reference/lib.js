/**
 * @fileoverview added by tsickle
 * Generated from: test_files/direct_externs_type_reference/lib.ts
 */
goog.module('test_files.direct_externs_type_reference.lib');
var module = module || { id: 'test_files/direct_externs_type_reference/lib.ts' };
goog.require('tslib');
const tsickle_clutz2_generated_dee_dot_tee_ess_1 = goog.requireType("test_files.direct_externs_type_reference.clutz2_generated_dee_dot_tee_ess");
const tsickle_clutz_generated_dee_dot_tee_ess_2 = goog.requireType("test_files.direct_externs_type_reference.clutz_generated_dee_dot_tee_ess");
const tsickle_literal_dee_dot_tee_ess_3 = goog.requireType("test_files.direct_externs_type_reference.literal_dee_dot_tee_ess");
const tsickle_tsickle_generated_dee_dot_tee_ess_4 = goog.requireType("test_files.direct_externs_type_reference.tsickle_generated_dee_dot_tee_ess");
/**
 * @param {string} input
 * @return {string}
 */
function returnsString(input) {
    return input;
}
exports.returnsString = returnsString;
/**
 * @param {string} input
 * @return {!tsickle_literal_dee_dot_tee_ess_3.hasString}
 */
function returnsLiteralDtsImportedType(input) {
    return { string: input };
}
exports.returnsLiteralDtsImportedType = returnsLiteralDtsImportedType;
/**
 * @param {string} input
 * @return {!tsickle_clutz_generated_dee_dot_tee_ess_2.hasBool}
 */
function returnsClutzDtsImportedType(input) {
    return { bool: input.startsWith('some prefix') };
}
exports.returnsClutzDtsImportedType = returnsClutzDtsImportedType;
/**
 * @param {string} input
 * @return {!tsickle_clutz2_generated_dee_dot_tee_ess_1.hasBoolAndNum}
 */
function returnsClutz2DtsImportedType(input) {
    return { bool: input.startsWith('some prefix'), num: input.length };
}
exports.returnsClutz2DtsImportedType = returnsClutz2DtsImportedType;
/**
 * @param {string} input
 * @return {!tsickle_tsickle_generated_dee_dot_tee_ess_4.hasNumber}
 */
function returnsTsickleDtsImportedType(input) {
    return { num: input.length };
}
exports.returnsTsickleDtsImportedType = returnsTsickleDtsImportedType;
