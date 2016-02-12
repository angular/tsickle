var EnumTest1;
(function (EnumTest1) {
    EnumTest1[EnumTest1["XYZ"] = 0] = "XYZ";
    EnumTest1[EnumTest1["PI"] = 3.14159] = "PI";
})(EnumTest1 || (EnumTest1 = {}));
EnumTest1.XYZ = 0;
EnumTest1.PI = 3.14159;
// This additional exported enum is here to exercise the fix for issue #51.
export var EnumTest2;
(function (EnumTest2) {
    EnumTest2[EnumTest2["XYZ"] = 0] = "XYZ";
    EnumTest2[EnumTest2["PI"] = 3.14159] = "PI";
})(EnumTest2 || (EnumTest2 = {}));
EnumTest2.XYZ = 0;
EnumTest2.PI = 3.14159;
