/** @fileoverview tests "export as namespace" with an exported subnamespace. */

declare namespace anamespace {
  export class NamespacedClass { method(): string; }
}

// On the Closure side, this must generate a global `exportedNamespaceIncludingImportEq` symbol.
// exportedNamespaceIncludingImportEq.NamespacedClass must resolve to the class above, i.e. the
// export = statement below dereferences the global exported namespace.
export = anamespace;
export as namespace exportedNamespaceIncludingImportEq;
