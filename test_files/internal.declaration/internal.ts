/**
 * @fileoverview Test to reproduce that \@internal declarations are not
 * re-exported for Clutz. There should not be any `.d.ts` aliases generated for
 * the declarations below.
 */

/** @internal */
export class InternalClass {}

/** @internal */
export const INTERNAL_CONSTANT = 42;

/** @internal */
export function internalFunction() {
  return 42;
}

/** @internal */
export enum InternalEnum {
}

/** @internal */
export interface InternalInterface {}

/** @internal */
// tslint:disable-next-line:no-namespace
export namespace InternalNamespace {}
