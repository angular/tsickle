/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @fileoverview This comment is ignored by Closure compiler.
 * @suppress {undefinedVars}
 */
/**
 * @fileoverview The last fileoverview actually takes effect.
 * @suppress {const}
 */
/** Here's another trailing comment */

function f() {
  // Make sure the {const} suppression above is maintained.
  /** @const */
  let x = 3;
  x = 4;
}

export {};
