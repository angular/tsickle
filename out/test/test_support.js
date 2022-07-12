"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.pathToModuleName = exports.expectDiagnosticsEmpty = exports.formatDiagnostics = exports.addDiffMatchers = exports.allDtsPaths = exports.goldenTests = exports.GoldenFileTest = exports.createProgramAndHost = exports.createSourceCachingHost = exports.createProgram = exports.inlineSourceMapCompilerOptions = exports.sourceMapCompilerOptions = exports.compilerOptions = exports.baseCompilerOptions = exports.relativeToTsickleRoot = exports.rootDir = void 0;
// Install source-map-support so that stack traces are mapped back to TS code.
require("source-map-support");
const diff_match_patch_1 = require("diff-match-patch");
const fs = require("fs");
const glob = require("glob");
const path = require("path");
const ts = require("typescript");
const cliSupport = require("../src/cli_support");
/** Returns true if the current build (likely) runs under bazel. */
function isInBazel() {
    return !!process.env['RUNFILES'];
}
/**
 * Return the 'root dir' under tests, which is the path to the image of
 * the source tree set up under the hermetic testing environment.
 */
function rootDir() {
    const runfiles = process.env['RUNFILES'];
    if (!runfiles) {
        return path.join(__dirname, '..', '..');
    }
    return path.join(runfiles, 'tsickle');
}
exports.rootDir = rootDir;
/**
 * Returns the given path, but relative to the root directory of tsickle (i.e.
 * the directory named tsickle).
 */
function relativeToTsickleRoot(filename) {
    return path.relative(rootDir(), filename);
}
exports.relativeToTsickleRoot = relativeToTsickleRoot;
/**
 * Absolute path to tslib.d.ts.
 *
 * The test suite runs the TS compiler, which wants to load tslib.
 * But bazel wants to run the test suite hermetically, so TS fails to find
 * tslib if we let it do its normal module resolution.  So instead we fix
 * the path here to the known path to the desired file.
 */
function tslibPath() {
    // In bazel.
    const p = path.join(rootDir(), '../npm/node_modules/tslib/tslib.d.ts');
    if (fs.existsSync(p))
        return p;
    // In plain nodejs.
    return path.join(rootDir(), 'node_modules/tslib/tslib.d.ts');
}
/** Base compiler options to be customized and exposed. */
exports.baseCompilerOptions = {
    // Down level to ES2015: Angular users must lower "await" statements so that
    // zone can intercept
    // them, so many users do down-level. This allows testing
    // await_transformer.ts.
    target: ts.ScriptTarget.ES2015,
    // Disable searching for @types typings. This prevents TS from looking
    // around for a node_modules directory.
    types: [],
    // Setting the target to ES2015 sets the lib field to ['lib.es6.d.ts'] by
    // default. Override this value to also provide type declarations for BigInt
    // literals.
    lib: ['lib.es6.d.ts', 'lib.es2020.bigint.d.ts'],
    skipDefaultLibCheck: true,
    experimentalDecorators: true,
    module: ts.ModuleKind.CommonJS,
    strictNullChecks: true,
    noImplicitUseStrict: true,
    allowJs: false,
    importHelpers: true,
    noEmitHelpers: true,
    stripInternal: true,
    baseUrl: '.',
    paths: {
        // The compiler builtin 'tslib' library is looked up by name,
        // so this entry controls which code is used for tslib.
        'tslib': [tslibPath()]
    },
};
/** The TypeScript compiler options used by the test suite. */
exports.compilerOptions = Object.assign(Object.assign({}, exports.baseCompilerOptions), { emitDecoratorMetadata: true, jsx: ts.JsxEmit.React, 
    // Tests assume that rootDir is always present.
    rootDir: rootDir() });
/**
 * Basic compiler options for source map tests. Compose with
 * generateOutfileCompilerOptions() or inlineSourceMapCompilerOptions to
 * customize the options.
 */
exports.sourceMapCompilerOptions = Object.assign(Object.assign({}, exports.baseCompilerOptions), { inlineSources: true, declaration: true, sourceMap: true });
/**
 * Compose with sourceMapCompilerOptions if you want inline source maps,
 * instead of different files.
 */
exports.inlineSourceMapCompilerOptions = {
    inlineSourceMap: true,
    sourceMap: false,
};
const cachedLibs = new Map();
const cachedLibDir = path.normalize(path.dirname(ts.getDefaultLibFilePath({})));
/** Creates a ts.Program from a set of input files. */
function createProgram(sources, tsCompilerOptions = exports.compilerOptions) {
    return createProgramAndHost(sources, tsCompilerOptions).program;
}
exports.createProgram = createProgram;
function createSourceCachingHost(sources, tsCompilerOptions = exports.compilerOptions) {
    const host = ts.createCompilerHost(tsCompilerOptions);
    host.getCurrentDirectory = () => {
        return rootDir();
    };
    host.getSourceFile = (fileName, languageVersion, onError) => {
        cliSupport.assertAbsolute(fileName);
        // Normalize path to fix wrong directory separators on Windows which
        // would break the equality check.
        fileName = path.normalize(fileName);
        if (cachedLibs.has(fileName))
            return cachedLibs.get(fileName);
        // Cache files in TypeScript's lib directory.
        if (fileName.startsWith(cachedLibDir)) {
            const sf = ts.createSourceFile(fileName, fs.readFileSync(fileName, 'utf8'), ts.ScriptTarget.Latest, true);
            cachedLibs.set(fileName, sf);
            return sf;
        }
        if (fileName === tslibPath()) {
            return ts.createSourceFile(fileName, fs.readFileSync(fileName, 'utf8'), ts.ScriptTarget.Latest, true);
        }
        const contents = sources.get(fileName);
        if (contents !== undefined) {
            return ts.createSourceFile(fileName, contents, ts.ScriptTarget.Latest, true);
        }
        throw new Error(`unexpected file read of ${fileName} not in ${Array.from(sources.keys())}`);
    };
    const originalFileExists = host.fileExists;
    host.fileExists = (fileName) => {
        // Note that TS appears to sometimes ask about relative paths, but we only
        // store absolute paths, and we don't need to satisfy queries about relative
        // paths to be correct here.
        if (sources.has(fileName))
            return true;
        if (fileName === tslibPath())
            return true;
        // Typescript occasionally needs to look on disk for files we don't pass into
        // the program as a source (eg to resolve a module that's in node_modules),
        // but only .ts files explicitly passed in should be findable
        if (/\.ts$/.test(fileName)) {
            return false;
        }
        return originalFileExists.call(host, fileName);
    };
    return host;
}
exports.createSourceCachingHost = createSourceCachingHost;
function createProgramAndHost(sources, tsCompilerOptions = exports.compilerOptions) {
    const host = createSourceCachingHost(sources);
    const program = ts.createProgram(Array.from(sources.keys()), tsCompilerOptions, host);
    return { program, host };
}
exports.createProgramAndHost = createProgramAndHost;
class GoldenFileTest {
    /**
     * @param root Absolute path to directory containing test.
     * @param tsPaths Relative paths from this.path to all .ts/.d.ts files in the
     *     test.
     */
    constructor(root, tsPaths) {
        this.root = root;
        this.tsPaths = tsPaths;
        /** Short name for test, from the directory name. */
        this.name = path.basename(this.root);
        cliSupport.assertAbsolute(this.root);
    }
    /**
     * Returns the absolute path to where generated externs will be kept.
     */
    externsPath() {
        return path.join(this.root, 'externs.js');
    }
    /**
     * Returns absolute paths to "input" files: human-authored files, as distinct
     * from goldens.
     */
    inputPaths() {
        return this.tsPaths
            .filter(p => {
            // For .declaration tests, .d.ts's are goldens, not inputs, when there
            // is a corresponding .ts file.
            if (this.isDeclarationTest && p.endsWith('.d.ts') &&
                this.tsPaths.includes(p.replace(/\.d\.ts$/, '.ts'))) {
                return false;
            }
            return true;
        })
            .map(p => path.join(this.root, p));
    }
    /**
     * Gets the absolute paths to the expected .js outputs of the test.
     */
    jsPaths() {
        return this.tsPaths.filter(f => !/\.d\.ts/.test(f))
            .map(f => path.join(this.root, GoldenFileTest.tsPathToJs(f)));
    }
    /**
     * Gets the absolute paths to the expected '.tsmes.' outputs of the test.
     */
    tsMigrationExportsShimPaths() {
        return this.tsPaths
            .map((p) => [p.replace('.ts', '.tsmes.d.ts'),
            p.replace('.ts', '.tsmes.js')])
            .flat()
            .map((p) => path.join(this.root, p))
            .filter((p) => fs.existsSync(p));
    }
    /**
     * Returns true for 'declaration' tests, which are golden tests that verify
     * the generated .d.ts output from compilation.  Normally tests are only
     * verifying the generated .js output.
     */
    get isDeclarationTest() {
        return /\.declaration\b/.test(this.name);
    }
    get isUntypedTest() {
        return /\.untyped\b/.test(this.name);
    }
    get isPureTransformerTest() {
        return /\.puretransform\b/.test(this.name);
    }
    /** True if the test is testing es5 output; es6 output otherwise. */
    get isEs5Target() {
        return /\.es5\b/.test(this.name);
    }
    get hasShim() {
        return /\.shim\b/.test(this.name);
    }
    get isTsmesEnabledTest() {
        return !/\.tsmes_disabled\./.test(this.name);
    }
    static tsPathToJs(tsPath) {
        return tsPath.replace(/\.tsx?$/, '.js');
    }
}
exports.GoldenFileTest = GoldenFileTest;
function goldenTests() {
    const basePath = path.join(rootDir(), 'test_files');
    const testNames = fs.readdirSync(basePath);
    let testDirs = testNames.map(testName => path.join(basePath, testName))
        .filter(testDir => fs.statSync(testDir).isDirectory());
    if (!isInBazel()) {
        // TODO(nickreid): the migration shim code is incompatible with the open
        // source build.
        testDirs = testDirs.filter(testDir => !testDir.includes('ts_migration_exports_shim'));
    }
    const tests = testDirs.map(testDir => {
        let tsPaths = glob.sync(path.join(testDir, '**/*.ts'));
        tsPaths = tsPaths.concat(glob.sync(path.join(testDir, '*.tsx')));
        tsPaths = tsPaths.filter(p => !p.match(/\.(tsickle|decorated|tsmes)\./));
        const tsFiles = tsPaths.map(f => path.relative(testDir, f));
        tsFiles.sort(); // Source order is significant for externs concatenation after the test.
        return new GoldenFileTest(testDir, tsFiles);
    });
    return tests;
}
exports.goldenTests = goldenTests;
/**
 * Returns absolute paths to every .d.ts in the test_files tree, for
 * verification by the e2e_clutz_dts_test.
 */
function allDtsPaths() {
    return glob.sync(path.join(rootDir(), 'test_files', '**/*.d.ts'));
}
exports.allDtsPaths = allDtsPaths;
/**
 * A Jasmine "compare" function that compares the strings actual vs expected, and produces a human
 * readable, diff using diff-match-patch.
 */
function diffStrings(actual, expected) {
    if (actual === expected)
        return { pass: true };
    if (typeof actual !== 'string' || typeof expected !== 'string') {
        return {
            pass: false,
            message: `toEqualWithDiff takes two strings, got ${actual}, ${expected}`
        };
    }
    const dmp = new diff_match_patch_1.diff_match_patch();
    dmp.Match_Distance = 0;
    dmp.Match_Threshold = 0;
    const diff = dmp.diff_main(expected, actual);
    dmp.diff_cleanupSemantic(diff);
    if (!diff.length) {
        return { pass: true };
    }
    let message = '\nStrings differ:\n\x1B[37;41m⌊missing expected content⌋\x1b[0m ' +
        '/ \x1B[90;42m⌈new actual content⌉\x1b[0m\n\n';
    for (const [diffKind, text] of diff) {
        switch (diffKind) {
            case diff_match_patch_1.DIFF_EQUAL:
                message += text;
                break;
            case diff_match_patch_1.DIFF_DELETE:
                // light gray on red.
                message += '\x1B[37;41m⌊' + text + '⌋\x1B[0m';
                break;
            case diff_match_patch_1.DIFF_INSERT:
                // dark gray on green.
                message += '\x1B[90;42m⌈' + text + '⌉\x1B[0m';
                break;
            default:
                throw new Error(`unexpected diff result: [${diffKind}, ${text}]`);
        }
    }
    return { pass: false, message };
}
/**
 * Add
 *   beforeEach(() => { testSupport.addDiffMatchers(); });
 * Then use expect(...).toEqualWithDiff(...) in your test to get colored diff output on expectation
 * failures.
 */
function addDiffMatchers() {
    jasmine.addMatchers({
        toEqualWithDiff() {
            return { compare: diffStrings };
        },
    });
}
exports.addDiffMatchers = addDiffMatchers;
function formatDiagnostics(diags) {
    // TODO(evanm): this should reuse the CompilerHost.
    const host = {
        getCurrentDirectory: () => rootDir(),
        getCanonicalFileName(filename) {
            return filename;
        },
        getNewLine() {
            return ts.sys.newLine;
        },
    };
    return ts.formatDiagnostics(diags, host);
}
exports.formatDiagnostics = formatDiagnostics;
/**
 * expectDiagnosticsEmpty is just
 *   expect(diags.length).toBe(0)
 * but prints some context if it fails.
 */
function expectDiagnosticsEmpty(diags) {
    if (diags.length !== 0) {
        throw new Error(`Expected no diagnostics but got: ` + formatDiagnostics(diags));
    }
}
exports.expectDiagnosticsEmpty = expectDiagnosticsEmpty;
/**
 * Test-friendly wrapper of cliSupport.pathToModuleName.
 *
 * This wrapper special-cases the handling of the 'tslib' import to ensure the
 * test goldens always refer to it by its generic name (rather than some
 * environment-specific path).
 */
function pathToModuleName(rootModulePath, context, fileName) {
    if (fileName === tslibPath())
        return 'tslib';
    return cliSupport.pathToModuleName(rootModulePath, context, fileName);
}
exports.pathToModuleName = pathToModuleName;
//# sourceMappingURL=test_support.js.map