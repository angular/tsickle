/**
 * @fileoverview Check that enums are translated to a var declaration
 *   when namespace transformation is turned off, i.e. the build target
 *   has the attribute --allow_unoptimized_namespaces.
 * @suppress {checkTypes,uselessCode}
 */

/**
 * This enum should be translated to `var E = {...}` instead of the usual
 * `const E = {...}`
 */
export enum E {
  e0 = 0,
  e1,
  e2
}

// We need to emit the enum as a var declaration so that declaration
// merging with a namespace works. The unoptimized namespace is emitted
// by tsc as a var declaration and an IIFE.
export namespace E {
  export function fromString(s: string) {
    return E.e0;
  }
}

const foo = E.e2;
