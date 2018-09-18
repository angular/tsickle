/** @fileoverview Tests generating externs for ambient enum declarations. */

declare enum AmbientEnum {
  ENUM_MEMBER_1 = 1,
  ENUM_MEMBER_2 = 5,
}

declare enum AmbientStringEnum {
  ENUM_MEMBER_1 = 'a',
  ENUM_MEMBER_2 = 'b',
}

declare enum MixedAmbientEnum {
  ENUM_MEMBER_1 = 'a',
  ENUM_MEMBER_2 = 1,
}

declare enum StringKeyEnum {
  'foo',
  '.tricky.invalid name',
}

declare namespace namespaceWithEnums {
  enum EnumInNamespace {
    V = 1,
  }
}
