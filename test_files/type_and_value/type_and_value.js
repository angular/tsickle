// test_files/type_and_value/type_and_value.ts(10,5): warning TS0: unhandled anonymous type with constructor signature but no declaration
// test_files/type_and_value/type_and_value.ts(16,5): warning TS0: type/symbol conflict for TypeAndValue, using {?} for now
// test_files/type_and_value/type_and_value.ts(19,5): warning TS0: type/symbol conflict for TemplatizedTypeAndValue, using {?} for now
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
goog.module('test_files.type_and_value.type_and_value');
var module = module || { id: 'test_files/type_and_value/type_and_value.ts' };
module = module;
exports = {};
const tsickle_forward_declare_1 = goog.forwardDeclare("test_files.type_and_value.module");
const conflict = goog.require('test_files.type_and_value.module');
// This test deals with symbols that are simultaneously types and values.
// Use a browser built-in as both a type and a value.
/** @type {function(new: (!Document)): ?} */
let useBuiltInAsValue = Document;
/** @type {!Document} */
let useBuiltInAsType;
// Use a user-defined class as both a type and a value.
/** @type {?} */
let useUserClassAsValue = conflict.Class;
/** @type {!tsickle_forward_declare_1.Class} */
let useUserClassAsType;
// Use a user-defined interface/value pair as both a type and a value.
/** @type {number} */
let useAsValue = conflict.TypeAndValue;
// Note: because of the conflict, we currently just use the type {?} here.
/** @type {?} */
let useAsType;
// Use a templatized user-defined interface/value pair as a type.
/** @type {?} */
let useAsTypeTemplatized;
