/**
 * @fileoverview Regression test for single valued enums. TypeScript's getBaseTypeOfLiteralType
 * returns the EnumLiteral type for SingleValuedEnum.C below, instead of SingleValuedEnum directly.
 * Previously, tsickle would then emit the type as `SingleValuedEnum.C`, which is illegal in
 * Closure.
 */

export enum FirstEnum {
  A,
  B,
}

export enum SingleValuedEnum {
  C
}

export type AliasSingleValueEnum = SingleValuedEnum;
export let useSingleValueEnum: SingleValuedEnum|null = null;
export type UnionOfEnums = FirstEnum|SingleValuedEnum;
