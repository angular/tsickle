enum EnumTest1 {XYZ, PI = 3.14159}
(<any>EnumTest1).XYZ = 0;
(<any>EnumTest1).PI =  3.14159;


// This additional exported enum is here to exercise the fix for issue #51.
export enum EnumTest2 {XYZ, PI = 3.14159}
(<any>EnumTest2).XYZ = 0;
(<any>EnumTest2).PI =  3.14159;

