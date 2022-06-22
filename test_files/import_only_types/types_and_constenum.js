/**
 * @fileoverview added by tsickle
 * Generated from: test_files/import_only_types/types_and_constenum.ts
 */
// const enum values are inlined, so even though const enums are values,
// TypeScript might not generate any imports for them, which means modules
// containing only types and const enums must be "force loaded".
goog.module('test_files.import_only_types.types_and_constenum');
var module = module || { id: 'test_files/import_only_types/types_and_constenum.ts' };
goog.require('tslib');
/** @enum {number} */
const ConstEnum = {
    BAR: 0,
    BAZ: 1,
};
exports.ConstEnum = ConstEnum;
/**
 * @record
 */
function SomeInterface() { }
exports.SomeInterface = SomeInterface;
