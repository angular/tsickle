/** @fileoverview namespace.d.ts declares a namespace SomeNamespace, which is then re-exported by export_equals.ts. */

export = SomeNamespace;
// Because this library has a shim, tsickle does not generate a global symbol for the `export as
// namespace` below.
export as namespace SomeNamespace;
declare namespace SomeNamespace {
  export class Clazz {}
}
