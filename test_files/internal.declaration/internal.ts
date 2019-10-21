/**
 * @fileoverview Test to reproduce that \@internal functions are not re-exported for Clutz. There
 * should not be any `.d.ts` aliases generated for the function below.
 */

/** @internal */
export function internalFunction() {
  return 42;
}
