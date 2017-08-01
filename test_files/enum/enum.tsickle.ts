Warning at test_files/enum/enum.ts:2:7: should not emit a 'never' type
Warning at test_files/enum/enum.ts:8:33: Declared property XYZ accessed with quotes. This can lead to renaming bugs. A better fix is to use 'declare interface' on the declaration.
Warning at test_files/enum/enum.ts:15:22: Declared property XYZ accessed with quotes. This can lead to renaming bugs. A better fix is to use 'declare interface' on the declaration.
====
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

// Line with a missing semicolon should not break the following enum.
const /** @type {!Array<?>} */ EnumTestMissingSemi = []
/** @enum {number} */
const EnumTest1: DontTypeCheckMe = {XYZ: 0, PI: 3.14159,};
EnumTest1[EnumTest1.XYZ] = "XYZ";
EnumTest1[EnumTest1.PI] = "PI";


// Verify that the resulting TypeScript still allows you to index into the enum with all the various
// ways allowed of enums.
let /** @type {EnumTest1} */ enumTestValue: EnumTest1 = EnumTest1.XYZ;
let /** @type {EnumTest1} */ enumTestValue2: EnumTest1 = EnumTest1['XYZ'];
let /** @type {string} */ enumNumIndex: string = EnumTest1[ /** @type {number} */(( /** @type {?} */((null as any)) as number))];
let /** @type {number} */ enumStrIndex: number = EnumTest1[ /** @type {string} */(( /** @type {?} */((null as any)) as string))];
/**
 * @param {EnumTest1} val
 * @return {void}
 */
function enumTestFunction(val: EnumTest1) {}
enumTestFunction(enumTestValue);

let /** @type {EnumTest1} */ enumTestLookup = EnumTest1["XYZ"];
let /** @type {?} */ enumTestLookup2 = EnumTest1["xyz".toUpperCase()];

// Verify that unions of enum members and other values are handled correctly.
let /** @type {(boolean|EnumTest1)} */ enumUnionType: EnumTest1|boolean = EnumTest1.XYZ;
/** @enum {number} */
const EnumTest2: DontTypeCheckMe = {XYZ: 0, PI: 3.14159,};
export {EnumTest2};
EnumTest2[EnumTest2.XYZ] = "XYZ";
EnumTest2[EnumTest2.PI] = "PI";


let /** @type {EnumTest2} */ variableUsingExportedEnum: EnumTest2;
/** @enum {number} */
const ComponentIndex: DontTypeCheckMe = {
  Scheme: 1,
  UserInfo: 2,
  Domain: 0,  // Be sure to exercise the code with a 0 enum value.
  UserInfo2: 2,};
ComponentIndex[ComponentIndex.Scheme] = "Scheme";
ComponentIndex[ComponentIndex.UserInfo] = "UserInfo";
ComponentIndex[ComponentIndex.Domain] = "Domain";
ComponentIndex[ComponentIndex.UserInfo2] = "UserInfo2";

/** @enum {number} */
const ConstEnum: DontTypeCheckMe = {
  EMITTED_ENUM_VALUE: 0,};
export {ConstEnum};

let /** @type {ConstEnum} */ constEnumValue = ConstEnum.EMITTED_ENUM_VALUE;
/**
 * @record
 */
export function InterfaceUsingConstEnum() {}


function InterfaceUsingConstEnum_tsickle_Closure_declarations() {
/** @type {ConstEnum} */
InterfaceUsingConstEnum.prototype.field;
/** @type {ConstEnum} */
InterfaceUsingConstEnum.prototype.field2;
}

export interface InterfaceUsingConstEnum {
  field: ConstEnum;
  // Known issue:
  // Error: Error at test_files/enum/enum.ts:75:11: Property 'field2' of exported interface has or is using private name 'ConstEnum'.
  field2: ConstEnum.EMITTED_ENUM_VALUE;
}
/** @enum {number} */
const EnumWithNonConstValues: DontTypeCheckMe = {
  Scheme:  (x => x + 1)(3),
  UserInfoRenamed: 2,};
EnumWithNonConstValues[EnumWithNonConstValues.Scheme] = "Scheme";
EnumWithNonConstValues[EnumWithNonConstValues.UserInfoRenamed] = "UserInfoRenamed";

