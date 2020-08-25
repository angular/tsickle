/**
 * @fileoverview This file simulates a TypeScript file that interacts with Clutz
 * types.  The expected output is that the generated .d.ts file has explicit
 * "import" statements that refer directly to the paths that define some of
 * the Clutz symbols (either goog: or look of disapproval) referenced in the
 * public API of this file.
 */

import * as demo1 from 'goog:demo1';
import demo3 from 'goog:demo3';

/**
 * demo1 is exposed in the public API via an import, so we expect the output
 * d.ts to have an import of the module underlying goog:demo1.
 */
export function f1(c: demo1.C) {}

/**
 * demo2 is exposed in the public API via a direct reference to the look of
 * disapproval namespace, so we expect the output d.ts to have an import of the
 * module underlying goog:demo2.
 */
export function f2(c: ಠ_ಠ.clutz.demo2.C) {}

/**
 * demo3 is used by this module, but not exported, so we don't expect an import
 * of the underlying module in the output d.ts.
 */
function f3(c: demo3) {}

/**
 * demo4 verifies that the Clutz type via 'typeof' still produces an import
 * statement in the output.  (It differs from the above in that a typeof node
 * in the TS AST contains the reference to a Clutz symbol as a value, not a
 * type.)
 */
export type f4 = typeof ಠ_ಠ.clutz.demo4;
