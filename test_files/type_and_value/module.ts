/**
 * @fileoverview TypeAndValue is both a type and a value, which is allowed in
 * TypeScript but disallowed in Closure.
 * @suppress {uselessCode}
 */

export interface TypeAndValue {
  z: number;
}
export var TypeAndValue = 3;

export interface TemplatizedTypeAndValue<T> {
  z: T
}
export var TemplatizedTypeAndValue = 1;

export class Class {
  z: number;
}

export enum Enum {
  A
}
