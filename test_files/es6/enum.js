/** @typedef {number} */
var FooEnum;
(function (FooEnum) {
    FooEnum[FooEnum["XYZ"] = 0] = "XYZ";
    FooEnum[FooEnum["PI"] = 3.14159] = "PI";
})(FooEnum || (FooEnum = {}));
/** @type {FooEnum} */
FooEnum.XYZ = 0;
/** @type {FooEnum} */
FooEnum.PI = 3.14159;
