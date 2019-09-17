// test_files/type_and_value/type_and_value.ts(17,5): warning TS0: unhandled anonymous type with constructor signature but no declaration
// test_files/type_and_value/type_and_value.ts(20,5): warning TS0: anonymous type has no symbol
// test_files/type_and_value/type_and_value.ts(39,5): warning TS0: anonymous type has no symbol
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.type_and_value.type_and_value');
var module = module || { id: 'test_files/type_and_value/type_and_value.ts' };
module = module;
exports = {};
const tsickle_module_1 = goog.requireType("test_files.type_and_value.module");
const conflict = goog.require('test_files.type_and_value.module');
// This test deals with symbols that are simultaneously types and values.
// Use a browser built-in as both a type and a value.
/** @type {function(new:Document)} */
let useBuiltInAsValue = Document;
/** @type {!Document} */
let useBuiltInAsType;
/** @type {function(new:Node)} */
let useAugmentAsValue = Node;
/** @type {!Node} */
let useAugmentAsType;
// Use a user-defined class as both a type and a value.
/** @type {?} */
let useUserClassAsValue = conflict.Class;
/** @type {!tsickle_module_1.Class} */
let useUserClassAsType;
/** @type {?} */
let useEnumAsValue = conflict.Enum;
/** @type {!tsickle_module_1.Enum} */
let useEnumAsType;
// Use a user-defined interface/value pair as both a type and a value.
/** @type {number} */
let useAsValue = conflict.TypeAndValue;
// Note: because of the conflict, we currently just use the type {?} here.
/** @type {!tsickle_module_1.TypeAndValue$$TSType} */
let useAsType;
// Use a templatized user-defined interface/value pair as a type.
/** @type {!tsickle_module_1.TemplatizedTypeAndValue$$TSType<string>} */
let useAsTypeTemplatized;
// Use the extern-defined types, found in typing.d.ts.
/** @type {!ExtTypeAndValue} */
let extUseAsType;
/** @type {number} */
let extUseAsValue = ExtTypeAndValue;
/** @type {?} */
let extUseEnumAsValue = ExtEnum;
/** @type {ExtEnum} */
let extUseEnumAsType;
