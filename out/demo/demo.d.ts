#!/usr/bin/env node
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import * as tsickle from 'tsickle';
/** Tsickle settings passed on the command line. */
export interface Settings {
    /** If provided, path to save externs to. */
    externsPath?: string;
    /** If provided, attempt to provide types rather than {?}. */
    isTyped?: boolean;
    /** If true, log internal debug warnings to the console. */
    verbose?: boolean;
    /** If true, warnings cause a non-zero exit code. */
    fatalWarnings?: boolean;
}
/**
 * Determine the lowest-level common parent directory of the given list of files.
 */
export declare function getCommonParentDirectory(fileNames: string[]): string;
/**
 * Compiles TypeScript code into Closure-compiler-ready JS.
 */
export declare function toClosureJS(options: ts.CompilerOptions, fileNames: string[], settings: Settings, writeFile: ts.WriteFileCallback): tsickle.EmitResult;
