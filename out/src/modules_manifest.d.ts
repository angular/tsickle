/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export interface FileMap<T> {
    [fileName: string]: T;
}
/** A class that maintains the module dependency graph of output JS files. */
export declare class ModulesManifest {
    /** Map of googmodule module name to file name */
    private readonly moduleToFileName;
    /** Map of file name to arrays of imported googmodule module names */
    private readonly referencedModules;
    addManifest(other: ModulesManifest): void;
    addModule(fileName: string, module: string): void;
    addReferencedModule(fileName: string, resolvedModule: string): void;
    get modules(): string[];
    getFileNameFromModule(module: string): string;
    get fileNames(): string[];
    getReferencedModules(fileName: string): string[];
}
