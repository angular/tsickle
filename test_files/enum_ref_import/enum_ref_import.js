/**
 *
 * @fileoverview TypeScript statically resolves enum member values to constants, if possible, and
 * directly emits those constants. Because of this, it also elides any imports for modules
 * referenced in the expressions of such constant initializers.
 *
 * The test below reproduces a problem where a compile-time constant value (such as another enum's
 * value) is only referenced in enum member. Because tsickle rewrites the enum to an object literal
 * initializer (`var ValuesInInitializer = {ENUM_MEMBER: Enum.X}`), TypeScript would no longer
 * replace the initializer with the constant value, but would still elide the import (for `Enum`
 * here). Thus we'd emit code that references an undeclared symbol.
 *
 * Generated from: test_files/enum_ref_import/enum_ref_import.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.enum_ref_import.enum_ref_import');
var module = module || { id: 'test_files/enum_ref_import/enum_ref_import.ts' };
module = module;
goog.require('tslib');
const tsickle_exporter_1 = goog.requireType("test_files.enum_ref_import.exporter");
/** @enum {string} */
const ValuesInInitializer = {
    ENUM_MEMBER: "x",
};
exports.ValuesInInitializer = ValuesInInitializer;
