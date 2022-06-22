/**
 * @fileoverview Line with a missing semicolon should not break the following
 * enum.
 * @suppress {checkTypes,uselessCode}
 */

const EnumTestMissingSemi = [] 
enum EnumTest1 { XYZ, PI = 3.14159 }

// Verify that the resulting TypeScript still allows you to index into the enum
// with all the various ways allowed of enums.
let enumTestValue: EnumTest1 = EnumTest1.XYZ;
let enumTestValue2: EnumTest1 = EnumTest1['XYZ'];
let enumNumIndex: string = EnumTest1[null as any as number];
let enumStrIndex: number = EnumTest1[null as any as string];
let nullableEnum: EnumTest1|null = null;

function enumTestFunction(val: EnumTest1) {}
enumTestFunction(enumTestValue);

let enumTestLookup = EnumTest1['XYZ'];
let enumTestLookup2 = EnumTest1['xyz'.toUpperCase()];

// Verify that unions of enum members and other values are handled correctly.
let enumUnionType: EnumTest1|boolean = EnumTest1.XYZ;

// This additional exported enum is here to exercise the fix for issue #51.
export enum EnumTest2 {
  XYZ,
  PI = 3.14159
}

let variableUsingExportedEnum: EnumTest2;

// Repro for #97
enum ComponentIndex {
  Scheme = 1,
  UserInfo,
  Domain = 0,  // Be sure to exercise the code with a 0 enum value.
  UserInfo2 = UserInfo,
}

// const enums are emitted so that Closure code can refer to their types and
// values.
export const enum ConstEnum {
  EMITTED_ENUM_VALUE,
  EMITTED_ENUM_VALUE_2,
}
let constEnumValue = ConstEnum.EMITTED_ENUM_VALUE;
export interface InterfaceUsingConstEnum {
  field: ConstEnum;
  // Known issue:
  // Error: Error at test_files/enum/enum.ts:75:11: Property 'field2' of
  // exported interface has or is using private name 'ConstEnum'.
  field2: ConstEnum.EMITTED_ENUM_VALUE;
}

// One place where enums with non-constant values make sense is when
// you are exporting a Closure value into a TypeScript namespace:
//   import Foo from 'goog:bar.baz';
//   export enum MyEnum { MyFoo = Foo }
// However, just immediately evaluating an arrow expression as done here
// is sufficient to trigger the non-constant value code path that we're
// testing with this block.
enum EnumWithNonConstValues {
  Scheme = (x => x + 1)(3),
  UserInfoRenamed = ComponentIndex.UserInfo,
}

enum StringEnum {
  STR = 'abc',
  OTHER_STR = 'xyz',
}

// Enum members with 'string' keys require slightly different syntax
// when emitting the reverse mapping, which we test with this block.
enum StringKeyEnum {
  'string key' = 1,
  'string key 2' = 0
}

// Test emitting for enums with a mixture of features:
// - string values
// - number values
// - string keys
enum MixedEnum {
  STR = 'abc',
  NUM = 3,
  'string key' = 4
}

/** JSDoc in here. */
export enum EnumWithJSDoc {
  /** @export */ MEMBER_WITH_JSDOC,
  /** @someTag */ MEMBER_WITH_UNRECOGNIZED_JSDOC,
}
