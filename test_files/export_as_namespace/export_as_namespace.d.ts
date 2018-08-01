/** @fileoverview tests "export as namespace" in a global (non-module) .d.ts file. */

export declare namespace foo {
  export class Bar {
    baz(): void;
  }
}

// On the Closure side, this must generate a global `exportNamespace` symbol.
// exportNamespace.foo must resolve to the namespace above.
export as namespace exportNamespace;
