/**
 * @fileoverview Tests declaring a namespace in a module .d.ts file, as a globally available symbol
 * using a `declare global` block, where the .
 */

declare global {
  namespace globalParentNamespace {
    namespace globalNestedNamespace {
      export const x: number;
    }
  }
}

// tsickle must emit the `globalParentNamespace` reference below as a global name, not the mangled
// module scoped name. This is currently unsupported, tsickle reports an error for this pattern (see
// dtsdiagnostics.txt).
export = globalParentNamespace.globalNestedNamespace;
