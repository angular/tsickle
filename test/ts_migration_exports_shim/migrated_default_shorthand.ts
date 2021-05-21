/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * See what happens when we use the shorthand syntax for shimming named
 * exports.
 */

export const SomeConstant = 42;

goog.tsMigrationDefaultExportsShim('migrated.module.default_shorthand');
