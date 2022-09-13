// test_files/enum/enum.ts(7,7): warning TS0: should not emit a 'never' type
/**
 *
 * @fileoverview Line with a missing semicolon should not break the following
 * enum.
 * Generated from: test_files/enum/enum.ts
 * @suppress {checkTypes,uselessCode}
 *
 */
goog.module('test_files.enum.enum');
var module = module || { id: 'test_files/enum/enum.ts' };
goog.require('tslib');
/** @type {!Array<?>} */
const EnumTestMissingSemi = [];
/** @enum {number} */
const EnumTest1 = {
    XYZ: 0, PI: 3.14159,
};
EnumTest1[EnumTest1.XYZ] = 'XYZ';
EnumTest1[EnumTest1.PI] = 'PI';
// Verify that the resulting TypeScript still allows you to index into the enum
// with all the various ways allowed of enums.
/** @type {!EnumTest1} */
let enumTestValue = EnumTest1.XYZ;
/** @type {!EnumTest1} */
let enumTestValue2 = EnumTest1['XYZ'];
/** @type {string} */
let enumNumIndex = EnumTest1[(/** @type {number} */ ((/** @type {?} */ (null))))];
/** @type {number} */
let enumStrIndex = EnumTest1[(/** @type {string} */ ((/** @type {?} */ (null))))];
/** @type {(null|!EnumTest1)} */
let nullableEnum = null;
/**
 * @param {!EnumTest1} val
 * @return {void}
 */
function enumTestFunction(val) { }
enumTestFunction(enumTestValue);
/** @type {!EnumTest1} */
let enumTestLookup = EnumTest1['XYZ'];
/** @type {?} */
let enumTestLookup2 = EnumTest1['xyz'.toUpperCase()];
// Verify that unions of enum members and other values are handled correctly.
/** @type {(boolean|!EnumTest1)} */
let enumUnionType = EnumTest1.XYZ;
/** @enum {number} */
const EnumTest2 = {
    XYZ: 0,
    PI: 3.14159,
};
exports.EnumTest2 = EnumTest2;
EnumTest2[EnumTest2.XYZ] = 'XYZ';
EnumTest2[EnumTest2.PI] = 'PI';
/** @type {!EnumTest2} */
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
/** @type {!ConstEnum} */
let constEnumValue = 0 /* ConstEnum.EMITTED_ENUM_VALUE */;
/**
 * @record
 */
function InterfaceUsingConstEnum() { }
exports.InterfaceUsingConstEnum = InterfaceUsingConstEnum;
/* istanbul ignore if */
if (false) {
    /**
     * @type {!ConstEnum}
     * @public
     */
    InterfaceUsingConstEnum.prototype.field;
    /**
     * @type {!ConstEnum}
     * @public
     */
    InterfaceUsingConstEnum.prototype.field2;
}
/** @enum {number} */
const EnumWithNonConstValues = {
    Scheme: ((/**
     * @param {number} x
     * @return {number}
     */
    x => x + 1))(3),
    UserInfoRenamed: 2,
};
EnumWithNonConstValues[EnumWithNonConstValues.Scheme] = 'Scheme';
EnumWithNonConstValues[EnumWithNonConstValues.UserInfoRenamed] = 'UserInfoRenamed';
/** @enum {string} */
const StringEnum = {
    STR: "abc",
    OTHER_STR: "xyz",
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
    STR: "abc",
    NUM: 3,
    'string key': 4,
};
MixedEnum[MixedEnum.NUM] = 'NUM';
MixedEnum[MixedEnum['string key']] = 'string key';
/**
 * JSDoc in here.
 * @enum {number}
 */
const EnumWithJSDoc = {
    /**
     * @export
     */ MEMBER_WITH_JSDOC: 0,
    /**
     * \@someTag
     */ MEMBER_WITH_UNRECOGNIZED_JSDOC: 1,
};
exports.EnumWithJSDoc = EnumWithJSDoc;
EnumWithJSDoc[EnumWithJSDoc.MEMBER_WITH_JSDOC] = 'MEMBER_WITH_JSDOC';
EnumWithJSDoc[EnumWithJSDoc.MEMBER_WITH_UNRECOGNIZED_JSDOC] = 'MEMBER_WITH_UNRECOGNIZED_JSDOC';
