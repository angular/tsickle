// test_files/internal.declaration/internal.ts(27,18): error TS0: transformation of plain namespace not supported. (go/ts-merged-namespaces)
/**
 * @fileoverview Test to reproduce that \@internal declarations are not
 * re-exported for Clutz. There should not be any `.d.ts` aliases generated for
 * the declarations below.
 */
export {};
