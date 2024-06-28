/**
 * @fileoverview Test overloaded function type emit.
 */

export function ɵinput(): null;
export function ɵinput(initialValue: any): null;
export function ɵinput(initialValue?: any): null {
  return null;
}
export type InputFn = typeof ɵinput;
export const input = ɵinput;
