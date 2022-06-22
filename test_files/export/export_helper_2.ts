/**
 * @fileoverview This file isn't itself a test case, but it is imported by the
 * export.in.ts test case.
 * @suppress {uselessCode}
 */

export let export2 = 3;
export let export3 = 3;
export let export4 = 3;

export type TypeDef = string|number;
export interface Interface {
  x: string;
}

export const enum ConstEnum {
  AValue = 1
}

export declare type DeclaredType = {
  a: number
};

export declare interface DeclaredInterface {
  a: number;
}
