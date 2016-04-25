type EnumTest1 = number;
/** @typedef {number} */
let EnumTest1: any = {};
EnumTest1[0] = "XYZ";
EnumTest1[3.14159] = "PI";
/** @type {EnumTest1} */
EnumTest1.XYZ = 0;
/** @type {EnumTest1} */
EnumTest1.PI = 3.14159;


// Sickle rewrites the above "enum" declaration into just a plain
// number.  Verify that the resulting TypeScript still allows you to
// index into the enum with all the various ways allowed of enums.
let /** @type {number} */ enumTestValue: EnumTest1 = EnumTest1.XYZ;
let /** @type {number} */ enumTestValue2: EnumTest1 = EnumTest1['XYZ'];
let /** @type {string} */ enumNumIndex: string = EnumTest1[null as number];
let /** @type {number} */ enumStrIndex: number = EnumTest1[null as string];
/**
 * @param {number} val
 * @return {void}
 */
function enumTestFunction(val: EnumTest1) {}
enumTestFunction(enumTestValue);

let /** @type {number} */ enumTestLookup = EnumTest1["XYZ"];type EnumTest2 = number;
/** @typedef {number} */
let EnumTest2: any = {};
EnumTest2[0] = "XYZ";
EnumTest2[3.14159] = "PI";
/** @type {EnumTest2} */
EnumTest2.XYZ = 0;
/** @type {EnumTest2} */
EnumTest2.PI = 3.14159;
type ComponentIndex = number;
/** @typedef {number} */
let ComponentIndex: any = {};
ComponentIndex[1] = "Scheme";
ComponentIndex[2] = "UserInfo";
ComponentIndex[3] = "Domain";
ComponentIndex[2] = "UserInfo2";
/** @type {ComponentIndex} */
ComponentIndex.Scheme = 1;
/** @type {ComponentIndex} */
ComponentIndex.UserInfo = 2;
/** @type {ComponentIndex} */
ComponentIndex.Domain = 3;
/** @type {ComponentIndex} */
ComponentIndex.UserInfo2 = 2;


// const enums not have any Closure output, as they are purely compile-time.
const enum EnumTestDisappears {
  ShouldNotHaveAnySickleOutput,
}
let /** @type {number} */ enumTestDisappears = EnumTestDisappears.ShouldNotHaveAnySickleOutput;
