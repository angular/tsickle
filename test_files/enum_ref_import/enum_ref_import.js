/**
 *
 * @fileoverview TypeScript statically resolves enum member values to constants,
 * if possible, and directly emits those constants. Because of this, TS should
 * elide any imports for modules referenced in the expressions of such constant
 * initializers.
 *
 * TODO(go/tissue/48124): The test below reproduces a problem starting TS 4.6-rc
 * where a compile-time constant value (such as another enum's value) is only
 * referenced in enum member. Because tsickle rewrites the enum to an object
 * literal initializer
 * (`var ValuesInInitializer = {ENUM_MEMBER: "x"}`), TypeScript no longer elides
 * the import (for `Enum` here). Thus we emit code that has an unncessary
 * import.
 *
 * Generated from: test_files/enum_ref_import/enum_ref_import.ts
 */
goog.module('test_files.enum_ref_import.enum_ref_import');
var module = module || { id: 'test_files/enum_ref_import/enum_ref_import.ts' };
goog.require('tslib');
const tsickle_exporter_1 = goog.requireType("test_files.enum_ref_import.exporter");
/** @enum {string} */
const ValuesInInitializer = {
    ENUM_MEMBER: "x",
};
exports.ValuesInInitializer = ValuesInInitializer;
