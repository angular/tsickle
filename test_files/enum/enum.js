// test_files/enum/enum.ts(2,7): warning TS0: should not emit a 'never' type
// test_files/enum/enum.ts(8,33): warning TS0: Declared property XYZ accessed with quotes. This can lead to renaming bugs. A better fix is to use 'declare interface' on the declaration.
// test_files/enum/enum.ts(15,22): warning TS0: Declared property XYZ accessed with quotes. This can lead to renaming bugs. A better fix is to use 'declare interface' on the declaration.
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
goog.module('test_files.enum.enum');
var module = module || { id: 'test_files/enum/enum.ts' };
module = module;
exports = {};
/** @type {!Array<?>} */
const EnumTestMissingSemi = [];
/** @enum {number} */
const EnumTest1 = {
    XYZ: 0, PI: 3.14159,
};
EnumTest1[EnumTest1.XYZ] = 'XYZ';
EnumTest1[EnumTest1.PI] = 'PI';
/** @type {EnumTest1} */
let enumTestValue = EnumTest1.XYZ;
/** @type {EnumTest1} */
let enumTestValue2 = EnumTest1['XYZ'];
/** @type {string} */
let enumNumIndex = EnumTest1[/** @type {number} */ ((null))];
/** @type {number} */
let enumStrIndex = EnumTest1[/** @type {string} */ ((null))];
/**
 * @param {EnumTest1} val
 * @return {void}
 */
function enumTestFunction(val) { }
enumTestFunction(enumTestValue);
/** @type {EnumTest1} */
let enumTestLookup = EnumTest1["XYZ"];
/** @type {?} */
let enumTestLookup2 = EnumTest1["xyz".toUpperCase()];
/** @type {(boolean|EnumTest1)} */
let enumUnionType = EnumTest1.XYZ;
/** @enum {number} */
const EnumTest2 = {
    XYZ: 0, PI: 3.14159,
};
exports.EnumTest2 = EnumTest2;
EnumTest2[EnumTest2.XYZ] = 'XYZ';
EnumTest2[EnumTest2.PI] = 'PI';
/** @type {EnumTest2} */
let variableUsingExportedEnum;
/** @enum {number} */
const ComponentIndex = {
    Scheme: 1,
    UserInfo: 2,
    Domain: 0,
    // Be sure to exercise the code with a 0 enum value.
    UserInfo2: 2,
};
ComponentIndex[ComponentIndex.Scheme] = 'Scheme';
ComponentIndex[ComponentIndex.UserInfo] = 'UserInfo';
ComponentIndex[ComponentIndex.Domain] = 'Domain';
ComponentIndex[ComponentIndex.UserInfo2] = 'UserInfo2';
/** @enum {number} */
const ConstEnum = {
    EMITTED_ENUM_VALUE: 0,
    EMITTED_ENUM_VALUE_2: 1,
};
exports.ConstEnum = ConstEnum;
/** @type {ConstEnum} */
let constEnumValue = 0 /* EMITTED_ENUM_VALUE */;
/**
 * @record
 */
function InterfaceUsingConstEnum() { }
exports.InterfaceUsingConstEnum = InterfaceUsingConstEnum;
if (false) {
    /** @type {ConstEnum} */
    InterfaceUsingConstEnum.prototype.field;
    /** @type {ConstEnum} */
    InterfaceUsingConstEnum.prototype.field2;
}
/** @enum {number} */
const EnumWithNonConstValues = {
    Scheme: (x => x + 1)(3),
    UserInfoRenamed: 2,
};
EnumWithNonConstValues[EnumWithNonConstValues.Scheme] = 'Scheme';
EnumWithNonConstValues[EnumWithNonConstValues.UserInfoRenamed] = 'UserInfoRenamed';
/** @enum {string} */
const StringEnum = {
    STR: 'abc',
    OTHER_STR: 'xyz',
};
/** @enum {number} */
const StringKeyEnum = {
    'string key': 1,
    'string key 2': 0,
};
StringKeyEnum[StringKeyEnum['string key']] = 'string key';
StringKeyEnum[StringKeyEnum['string key 2']] = 'string key 2';
/** @enum {?} */
const MixedEnum = {
    STR: 'abc',
    NUM: 3,
    'string key': 4,
};
MixedEnum[MixedEnum.NUM] = 'NUM';
MixedEnum[MixedEnum['string key']] = 'string key';
