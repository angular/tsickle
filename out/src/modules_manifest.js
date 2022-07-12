"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModulesManifest = void 0;
/** A class that maintains the module dependency graph of output JS files. */
class ModulesManifest {
    constructor() {
        /** Map of googmodule module name to file name */
        this.moduleToFileName = {};
        /** Map of file name to arrays of imported googmodule module names */
        this.referencedModules = {};
    }
    addManifest(other) {
        Object.assign(this.moduleToFileName, other.moduleToFileName);
        Object.assign(this.referencedModules, other.referencedModules);
    }
    addModule(fileName, module) {
        this.moduleToFileName[module] = fileName;
        this.referencedModules[fileName] = [];
    }
    addReferencedModule(fileName, resolvedModule) {
        this.referencedModules[fileName].push(resolvedModule);
    }
    get modules() {
        return Object.keys(this.moduleToFileName);
    }
    getFileNameFromModule(module) {
        return this.moduleToFileName[module];
    }
    get fileNames() {
        return Object.keys(this.referencedModules);
    }
    getReferencedModules(fileName) {
        return this.referencedModules[fileName];
    }
}
exports.ModulesManifest = ModulesManifest;
//# sourceMappingURL=modules_manifest.js.map