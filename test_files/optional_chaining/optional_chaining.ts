/**
 * @fileoverview Tests that tsickle handles non-nullable assertions in optional
 * chains correctly. The correct behavior is not emitting any special casts
 * because Closure Compiler will not check possibly-undefined property access.
 * If we did want to add a cast for maximum type correctness, it would require
 * adding parentheses, which would change the semantics of the optional chain.
 * For more information see jsdoc_transformer.ts.
 * @suppress {checkTypes}
 */

export {};

let basic: {a?: {b: number}}|undefined;
let basic1 = basic?.a!.b;

let deep: {a: {b?: {c: number}}}|undefined;
let deep1 = deep?.a.b!.c;
let deep2 = deep?.a?.b?.c!;

let nested: {a?: {b?: {c: number}}}|undefined;
let nested1 = nested?.a!.b!.c!;

function f1(n: number) {}
f1(nested?.a!.b!.c!);

let hasArray: {a?: {b?: Array<{c?: number}>}}|undefined;
let hasArray1 = hasArray?.a!.b![0].c!;

let hasFn: {
  a():
      undefined|{
        b: number;
      }
}|undefined;
let hasFn1 = hasFn?.a()!.b;

let hasOptionalFn: {
  a ? () :
      undefined|{
        b: number
      }
}|undefined;
let hasOptionalFn1 = hasOptionalFn?.a?.()!.b;

function f(a: any): any {
  return a.b()?.d()[0].f()!.e()[0]!;
}

function f2(a: any): any {
  return a?.().x.y!.z;
}
