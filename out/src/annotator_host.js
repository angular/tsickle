"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleNameAsIdentifier = void 0;
/**
 * Returns a mangled version of the module name (resolved file name) for source file.
 *
 * The mangled name is safe to use as a JavaScript identifier. It is used as a globally unique
 * prefix to scope symbols in externs file (see externs.ts).
 */
function moduleNameAsIdentifier(host, fileName) {
    return host.pathToModuleName('', fileName).replace(/\./g, '$');
}
exports.moduleNameAsIdentifier = moduleNameAsIdentifier;
//# sourceMappingURL=annotator_host.js.map