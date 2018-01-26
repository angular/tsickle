/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';

let rootModulePath: string;

// Postprocess generated JS.
export function pathToModuleName(context: string, fileName: string): string {
  fileName = fileName.replace(/\.[tj]s$/, '');

  if (fileName[0] === '.') {
    // './foo' or '../foo'.
    // Resolve the path against the dirname of the current module.
    fileName = path.join(path.dirname(context), fileName);
  }

  // Ensure consistency by naming all modules after their absolute paths
  fileName = path.resolve(fileName);

  if (rootModulePath) {
    fileName = path.relative(rootModulePath, fileName);
  }

  // Replace characters not supported by goog.module.
  const moduleName =
      fileName.replace(/\/|\\/g, '.').replace(/^[^a-zA-Z_$]/, '_').replace(/[^a-zA-Z0-9._$]/g, '_');

  return moduleName;
}

/**
 * Set the root path for all modules. If this is set, modules will have their names
 * shortened to paths relative to this path.
 */
export function setRootModulePath(rootPath: string) {
  rootModulePath = rootPath;
}
