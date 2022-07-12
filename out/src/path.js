"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalize = exports.relative = exports.dirname = exports.join = exports.isAbsolute = void 0;
/**
 * @fileoverview Path manipulation functions.
 * These are the functions exposed by nodejs in the 'path' module.
 *
 * But we actually use the TypeScript path-manipulation logic because:
 * 1) we want the exact same behaviors as TS;
 * 2) we don't depend on node's 'path' module when running under a browser
 * So we poke into their private API for these.
 */
const ts = require("typescript");
function isAbsolute(path) {
    return ts.isRootedDiskPath(path);
}
exports.isAbsolute = isAbsolute;
function join(p1, p2) {
    return ts.combinePaths(p1, p2);
}
exports.join = join;
function dirname(path) {
    return ts.getDirectoryPath(path);
}
exports.dirname = dirname;
function relative(base, rel) {
    return ts.convertToRelativePath(rel, base, p => p);
}
exports.relative = relative;
function normalize(path) {
    return ts.resolvePath(path);
}
exports.normalize = normalize;
//# sourceMappingURL=path.js.map