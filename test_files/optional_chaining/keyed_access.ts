/**
 * @fileoverview Tests that tsickle correctly handles casting to the correct
 * type after an optional property access. There was a bug where tsickle's
 * non-nullable assertion transformation would remove type information from a
 * node, which caused TypeScript to crash at a later stage in the compilation.
 * This test contains a minimal reproduction of real code we found that caused
 * that crash.
 * @suppress {checkTypes,uselessCode}
 */

export {};

interface T {
  a?: number;
  b?: number;
}

let t: T = {};
let obj: {a: {b?: {c?: {d?: 'a'|'b'}}}} = {a: {b: undefined}};

const key: 'a'|'b' = obj.a.b?.c!.d!;
t[key]!++;
