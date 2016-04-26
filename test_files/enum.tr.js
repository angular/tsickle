goog.module('sickle_test.enum');
let EnumTest1 = {};
EnumTest1[0] = "XYZ";
EnumTest1[3.14159] = "PI";
/** @type {number} */
EnumTest1.XYZ = 0;
/** @type {number} */
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
exports.EnumTest2 = {};
exports.EnumTest2[0] = "XYZ";
exports.EnumTest2[3.14159] = "PI";
/** @type {number} */
exports.EnumTest2.XYZ = 0;
/** @type {number} */
exports.EnumTest2.PI = 3.14159;
let ComponentIndex = {};
ComponentIndex[1] = "Scheme";
ComponentIndex[2] = "UserInfo";
ComponentIndex[3] = "Domain";
ComponentIndex[2] = "UserInfo2";
/** @type {number} */
ComponentIndex.Scheme = 1;
/** @type {number} */
ComponentIndex.UserInfo = 2;
/** @type {number} */
ComponentIndex.Domain = 3;
/** @type {number} */
ComponentIndex.UserInfo2 = 2;
let /** @type {number} */ enumTestDisappears = 0 /* ShouldNotHaveAnySickleOutput */;
