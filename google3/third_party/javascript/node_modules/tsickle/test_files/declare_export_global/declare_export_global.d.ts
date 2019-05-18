/**
 * @fileoverview Tests declaring a namespace in a module .d.ts file, as a globally available symbol
 * using a `declare global` block.
 */

declare global {
  namespace globalNamespace {
    export const x: number;
  }
}

// tsickle must emit the `globalNamespace` reference below as a global name, not the mangled module
// scoped name.
export = globalNamespace;
