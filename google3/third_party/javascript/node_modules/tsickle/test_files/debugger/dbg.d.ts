/**
 * @fileoverview Reproduces .d.ts files that use export {} declarations to work around namespaces
 * being reserved identifiers (such as debugger below).
 */

declare module outer {
  namespace _debugger {
    export class Foo {}
  }
  export {_debugger as debugger};

  namespace unrenamed {
    export const x: number;
  }
  export {unrenamed};
}
