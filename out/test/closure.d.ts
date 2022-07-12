/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Options for invoking the compiler. */
export interface Options {
    /**
     * Path to the Closure compiler .jar.
     * If unset, will resolve and use the 'google-closure-compiler' npm package
     * entry point.
     */
    jarPath?: string;
}
/**
 * The type of command-line flags passed to the compiler, as a map of
 * flag name to flag value.  Array-valued flags are translated into the
 * repeated form expected by the compiler.
 */
export interface Flags {
    [flag: string]: boolean | string | string[];
}
/** The type of compilation results, containing exit code and console output. */
export interface Result {
    exitCode: number;
    stdout: string;
    stderr: string;
}
/** Run the compiler, asynchronously returning a Result. */
export declare function compile(options: Options, flags: Flags): Promise<Result>;
