"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.pathToModuleName = exports.assertAbsolute = void 0;
const path = require("./path");
/**
 * asserts that the given fileName is an absolute path.
 *
 * The TypeScript API works in absolute paths, so we must be careful to resolve
 * paths before handing them over to TypeScript.
 */
function assertAbsolute(fileName) {
    if (!path.isAbsolute(fileName)) {
        throw new Error(`expected ${JSON.stringify(fileName)} to be absolute`);
    }
}
exports.assertAbsolute = assertAbsolute;
/**
 * Takes a context (ts.SourceFile.fileName of the current file) and the import URL of an ES6
 * import and generates a googmodule module name for the imported module.
 */
function pathToModuleName(rootModulePath, context, fileName) {
    fileName = fileName.replace(/(\.d)?\.[tj]s$/, '');
    if (fileName[0] === '.') {
        // './foo' or '../foo'.
        // Resolve the path against the dirname of the current module.
        fileName = path.join(path.dirname(context), fileName);
    }
    // TODO(evanm): various tests assume they can import relative paths like
    // 'foo/bar' and have them interpreted as root-relative; preserve that here.
    // Fix this by removing the next line.
    if (!path.isAbsolute(fileName))
        fileName = path.join(rootModulePath, fileName);
    // TODO(evanm): various tests assume they can pass in a 'fileName' like
    // 'goog:foo.bar' and have this function do something reasonable.
    // For correctness, the above must have produced an absolute path.
    // assertAbsolute(fileName);
    if (rootModulePath) {
        fileName = path.relative(rootModulePath, fileName);
    }
    // Replace characters not supported by goog.module.
    const moduleName = fileName.replace(/\/|\\/g, '.').replace(/^[^a-zA-Z_$]/, '_').replace(/[^a-zA-Z0-9._$]/g, '_');
    return moduleName;
}
exports.pathToModuleName = pathToModuleName;
//# sourceMappingURL=cli_support.js.map