/** @typedef {number} */
let EnumTest1 = {};
EnumTest1[0] = "XYZ";
EnumTest1[3.14159] = "PI";
/** @type {EnumTest1} */
EnumTest1.XYZ = 0;
/** @type {EnumTest1} */
EnumTest1.PI = 3.14159;
// Sickle rewrites the above "enum" declaration into just a plain
// number.  Verify that the resulting TypeScript still allows you to
// index into the enum with all the various ways allowed of enums.
let /** @type {number} */ enumTestValue = EnumTest1.XYZ;
let /** @type {number} */ enumTestValue2 = EnumTest1['XYZ'];
let /** @type {string} */ enumNumIndex = EnumTest1[null];
let /** @type {number} */ enumStrIndex = EnumTest1[null];
/**
 * @param {number} val
 * @return {void}
 */
function enumTestFunction(val) { }
enumTestFunction(enumTestValue);
let /** @type {number} */ enumTestLookup = EnumTest1["XYZ"];
/** @typedef {number} */
let EnumTest2 = {};
EnumTest2[0] = "XYZ";
EnumTest2[3.14159] = "PI";
/** @type {EnumTest2} */
EnumTest2.XYZ = 0;
/** @type {EnumTest2} */
EnumTest2.PI = 3.14159;
/** @typedef {number} */
let ComponentIndex = {};
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
let /** @type {number} */ enumTestDisappears = 0 /* ShouldNotHaveAnySickleOutput */;
