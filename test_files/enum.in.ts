enum EnumTest1 {XYZ, PI = 3.14159}

// This additional exported enum is here to exercise the fix for issue #51.
export enum EnumTest2 {XYZ, PI = 3.14159}

// Repro for #97
enum ComponentIndex {
  Scheme = 1,
  UserInfo,
  Domain
}
