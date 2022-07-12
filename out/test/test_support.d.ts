/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import 'source-map-support';
import * as ts from 'typescript';
/**
 * Return the 'root dir' under tests, which is the path to the image of
 * the source tree set up under the hermetic testing environment.
 */
export declare function rootDir(): string;
/**
 * Returns the given path, but relative to the root directory of tsickle (i.e.
 * the directory named tsickle).
 */
export declare function relativeToTsickleRoot(filename: string): string;
/** Base compiler options to be customized and exposed. */
export declare const baseCompilerOptions: ts.CompilerOptions;
/** The TypeScript compiler options used by the test suite. */
export declare const compilerOptions: ts.CompilerOptions;
/**
 * Basic compiler options for source map tests. Compose with
 * generateOutfileCompilerOptions() or inlineSourceMapCompilerOptions to
 * customize the options.
 */
export declare const sourceMapCompilerOptions: ts.CompilerOptions;
/**
 * Compose with sourceMapCompilerOptions if you want inline source maps,
 * instead of different files.
 */
export declare const inlineSourceMapCompilerOptions: ts.CompilerOptions;
/** Creates a ts.Program from a set of input files. */
export declare function createProgram(sources: Map<string, string>, tsCompilerOptions?: ts.CompilerOptions): ts.Program;
export declare function createSourceCachingHost(sources: Map<string, string>, tsCompilerOptions?: ts.CompilerOptions): ts.CompilerHost;
export declare function createProgramAndHost(sources: Map<string, string>, tsCompilerOptions?: ts.CompilerOptions): {
    host: ts.CompilerHost;
    program: ts.Program;
};
export declare class GoldenFileTest {
    readonly root: string;
    private readonly tsPaths;
    /** Short name for test, from the directory name. */
    readonly name: string;
    /**
     * @param root Absolute path to directory containing test.
     * @param tsPaths Relative paths from this.path to all .ts/.d.ts files in the
     *     test.
     */
    constructor(root: string, tsPaths: string[]);
    /**
     * Returns the absolute path to where generated externs will be kept.
     */
    externsPath(): string;
    /**
     * Returns absolute paths to "input" files: human-authored files, as distinct
     * from goldens.
     */
    inputPaths(): string[];
    /**
     * Gets the absolute paths to the expected .js outputs of the test.
     */
    jsPaths(): string[];
    /**
     * Gets the absolute paths to the expected '.tsmes.' outputs of the test.
     */
    tsMigrationExportsShimPaths(): string[];
    /**
     * Returns true for 'declaration' tests, which are golden tests that verify
     * the generated .d.ts output from compilation.  Normally tests are only
     * verifying the generated .js output.
     */
    get isDeclarationTest(): boolean;
    get isUntypedTest(): boolean;
    get isPureTransformerTest(): boolean;
    /** True if the test is testing es5 output; es6 output otherwise. */
    get isEs5Target(): boolean;
    get hasShim(): boolean;
    get isTsmesEnabledTest(): boolean;
    static tsPathToJs(tsPath: string): string;
}
export declare function goldenTests(): GoldenFileTest[];
/**
 * Returns absolute paths to every .d.ts in the test_files tree, for
 * verification by the e2e_clutz_dts_test.
 */
export declare function allDtsPaths(): string[];
declare global {
    namespace jasmine {
        interface Matchers<T> {
            toEqualWithDiff(expected: string): boolean;
        }
    }
}
/**
 * Add
 *   beforeEach(() => { testSupport.addDiffMatchers(); });
 * Then use expect(...).toEqualWithDiff(...) in your test to get colored diff output on expectation
 * failures.
 */
export declare function addDiffMatchers(): void;
export declare function formatDiagnostics(diags: ReadonlyArray<ts.Diagnostic>): string;
/**
 * expectDiagnosticsEmpty is just
 *   expect(diags.length).toBe(0)
 * but prints some context if it fails.
 */
export declare function expectDiagnosticsEmpty(diags: ReadonlyArray<ts.Diagnostic>): void;
/**
 * Test-friendly wrapper of cliSupport.pathToModuleName.
 *
 * This wrapper special-cases the handling of the 'tslib' import to ensure the
 * test goldens always refer to it by its generic name (rather than some
 * environment-specific path).
 */
export declare function pathToModuleName(rootModulePath: string, context: string, fileName: string): string;
