/**
 * @fileoverview Check the type generated when using a builtin symbol as
 * a computed property.
 */

// Note: this declaration is part of the TS standard library, but it doesn't
// hurt to restate it here, and the test suite runner doesn't include that
// library.
declare global {
  interface SymbolConstructor {
    readonly observable: symbol;
  }
}

// This test is verifying the type of this expression, which ultimately
// refers to some TypeScript internal __@observeable thing.  Note that
// Symbol.observable here refers to the above SymbolConstructor observable.
export let x: {
  [Symbol.observable]: string,
  'with spaces': string,
  otherField: string,
}|null = null;
