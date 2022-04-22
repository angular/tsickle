/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * See what happens when we use the shorthand syntax for shimming a named export
 * as a default export in JS but with a reserved keyword.
 */

const notConst = 'actually const';
export {notConst as const};

goog.tsMigrationDefaultExportsShim('migrated.module.default.const');
