/** @typedef {number} */
var EnumTest1;
(function (EnumTest1) {
    EnumTest1[EnumTest1["XYZ"] = 0] = "XYZ";
    EnumTest1[EnumTest1["PI"] = 3.14159] = "PI";
})(EnumTest1 || (EnumTest1 = {}));
/** @type {EnumTest1} */
EnumTest1.XYZ = 0;
/** @type {EnumTest1} */
EnumTest1.PI = 3.14159;
/** @typedef {number} */
// This additional exported enum is here to exercise the fix for issue #51.
export var EnumTest2;
(function (EnumTest2) {
    EnumTest2[EnumTest2["XYZ"] = 0] = "XYZ";
    EnumTest2[EnumTest2["PI"] = 3.14159] = "PI";
})(EnumTest2 || (EnumTest2 = {}));
/** @type {EnumTest2} */
EnumTest2.XYZ = 0;
/** @type {EnumTest2} */
EnumTest2.PI = 3.14159;
/** @typedef {number} */
// Repro for #97
var ComponentIndex;
(function (ComponentIndex) {
    ComponentIndex[ComponentIndex["Scheme"] = 1] = "Scheme";
    ComponentIndex[ComponentIndex["UserInfo"] = 2] = "UserInfo";
    ComponentIndex[ComponentIndex["Domain"] = 3] = "Domain";
    ComponentIndex[ComponentIndex["UserInfo2"] = 2] = "UserInfo2";
})(ComponentIndex || (ComponentIndex = {}));
/** @type {ComponentIndex} */
ComponentIndex.Scheme = 1;
/** @type {ComponentIndex} */
ComponentIndex.UserInfo = 2;
/** @type {ComponentIndex} */
ComponentIndex.Domain = 3;
/** @type {ComponentIndex} */
ComponentIndex.UserInfo2 = 2;
let enumTestDisappears = 0 /* ShouldNotHaveAnySickleOutput */;
