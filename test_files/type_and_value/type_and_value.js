// test_files/type_and_value/type_and_value.ts(19,5): warning TS0: unhandled anonymous type with constructor signature but no declaration
// test_files/type_and_value/type_and_value.ts(22,5): warning TS0: anonymous type has no symbol
// test_files/type_and_value/type_and_value.ts(28,5): warning TS0: type/symbol conflict for TypeAndValue, using {?} for now
// test_files/type_and_value/type_and_value.ts(31,5): warning TS0: type/symbol conflict for TemplatizedTypeAndValue, using {?} for now
// test_files/type_and_value/type_and_value.ts(38,5): warning TS0: type/symbol conflict for ExtTypeAndValue, using {?} for now
// test_files/type_and_value/type_and_value.ts(41,5): warning TS0: anonymous type has no symbol
// test_files/type_and_value/type_and_value.ts(46,1): warning TS0: dropped implements of a type/value conflict: conflict.TypeAndValue
/**
 * @fileoverview added by tsickle
 * Generated from: test_files/type_and_value/type_and_value.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.type_and_value.type_and_value');
var module = module || { id: 'test_files/type_and_value/type_and_value.ts' };
module = module;
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
/** @type {?} */
let useAsType;
// Use a templatized user-defined interface/value pair as a type.
/** @type {?} */
let useAsTypeTemplatized;
// Use the extern-defined types, found in typing.d.ts.
/** @type {?} */
let extUseAsType;
/** @type {number} */
let extUseAsValue = ExtTypeAndValue;
/** @type {?} */
let extUseEnumAsValue = ExtEnum;
/** @type {ExtEnum} */
let extUseEnumAsType;
// ImplementsTypeAndValue implements a symbol that resolves to both a type and a
// value, and thus the @implements clause is dropped by tsickle.
/**
 * tsickle: dropped implements of a type/value conflict: conflict.TypeAndValue
 */
class ImplementsTypeAndValue {
    constructor() {
        this.z = 1;
    }
}
if (false) {
    /** @type {number} */
    ImplementsTypeAndValue.prototype.z;
}
/**
 * ImplementsTypeAndValueBuiltin implements Boolean, which is both a type and a
 * value in the lib.d.ts. However we special case lib.d.ts builtins, and thus do
 * emit the implements clause.
 * @implements {Boolean}
 */
class ImplementsTypeAndValueBuiltin {
    /**
     * @return {boolean}
     */
    valueOf() {
        return false; // grumpycat
    }
}
exports.ImplementsTypeAndValueBuiltin = ImplementsTypeAndValueBuiltin;
