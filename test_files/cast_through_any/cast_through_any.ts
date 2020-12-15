/**
 * @fileoverview Tests that casts through `any` and `unknown` to another type
 * drop the inner cast in the Closure JavaScript output:
 *
 * This example code:
 *
 *     const x = a as any as B;
 *
 * should become (escaped for comments):
 *
 *     (\/** @type {!B} *\/ (a));
 */

export {};

interface A {
  prop: boolean;
}

interface B {
  prop: number;
}

const a: A = {
  prop: true
};

// tslint:disable-next-line:no-any
type AnyDuringFakeMigration = any;

// The `any` should be dropped in Closure JavaScript output and cast `a` to `B`
// directly.
// tslint:disable-next-line:no-any
const throughAny = a as any as B;
// An alias to `any` should have the same behavior as above.
// tslint:disable-next-line:ban-types
const throughAnyDuringMigration = a as AnyDuringFakeMigration as B;
// `unknown` should have the same behavior as `any` and `a` should be cast to
// `B` directly.
const throughUnknown = a as unknown as B;
// Casting through `{}` should retain the cast in JavaScript output.
const throughEmptyObjNotBackedOff = a as {} as B;
// Casting through a non-empty type should behave the same as above.
const throughTypeNotBackedOff = a as {prop: boolean | number} as B;
// Test that assignment to a property after this cast still works.
(a as unknown as ElementCSSInlineStyle).style.display = 'none';
