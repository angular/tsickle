/**
 * @fileoverview This file isn't itself a test case, but it is imported by the
 * export.in.ts test case.
 * @suppress {uselessCode}
 */

export * from './export_helper_2';
export let export1 = 3;
export let export2 = 3;

export interface Bar {
  barField: number;
}
export var export3: Bar;

export let export5 = 3;

export {TypeDef as RenamedTypeDef} from './export_helper_2';
