/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Install source-map-support so that stack traces are mapped back to TS code.
import 'source-map-support';

import {DIFF_DELETE, DIFF_EQUAL, DIFF_INSERT, diff_match_patch as DiffMatchPatch} from 'diff-match-patch';
import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import * as ts from 'typescript';

import * as cliSupport from '../src/cli_support';

/** Returns true if the current build (likely) runs under bazel. */
function isInBazel() {
  return !!process.env['RUNFILES'];
}

/**
 * Return the 'root dir' under tests, which is the path to the image of
 * the source tree set up under the hermetic testing environment.
 */
export function rootDir(): string {
  const runfiles = process.env['RUNFILES'];
  if (!runfiles) {
    return path.join(__dirname, '..', '..');
  }
  return path.join(runfiles, 'tsickle');
}

/**
 * Returns the given path, but relative to the root directory of tsickle (i.e.
 * the directory named tsickle).
 */
export function relativeToTsickleRoot(filename: string): string {
  return path.relative(rootDir(), filename);
}

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
  if (fs.existsSync(p)) return p;
  // In plain nodejs.
  return path.join(rootDir(), 'node_modules/tslib/tslib.d.ts');
}

/** Base compiler options to be customized and exposed. */
export const baseCompilerOptions: ts.CompilerOptions = {
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
  // TODO: b/285332972 - noImplicitUseStrict is deprecated. Investigate failing
  // async_functions test.
  ignoreDeprecations: '5.0',
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
export const compilerOptions: ts.CompilerOptions = {
  ...baseCompilerOptions,
  emitDecoratorMetadata: true,
  jsx: ts.JsxEmit.React,
  // Tests assume that rootDir is always present.
  rootDir: rootDir(),
};

/**
 * Basic compiler options for source map tests. Compose with
 * generateOutfileCompilerOptions() or inlineSourceMapCompilerOptions to
 * customize the options.
 */
export const sourceMapCompilerOptions: ts.CompilerOptions = {
  ...baseCompilerOptions,
  inlineSources: true,
  declaration: true,
  sourceMap: true,
};

/**
 * Compose with sourceMapCompilerOptions if you want inline source maps,
 * instead of different files.
 */
export const inlineSourceMapCompilerOptions: ts.CompilerOptions = {
  inlineSourceMap: true,
  sourceMap: false,
};

const cachedLibs = new Map<string, ts.SourceFile>();
const cachedLibDir = path.normalize(path.dirname(ts.getDefaultLibFilePath({})));

/** Creates a ts.Program from a set of input files. */
export function createProgram(
    sources: Map<string, string>,
    tsCompilerOptions: ts.CompilerOptions = compilerOptions): ts.Program {
  return createProgramAndHost(sources, tsCompilerOptions).program;
}

export function createSourceCachingHost(
    sources: Map<string, string>,
    tsCompilerOptions: ts.CompilerOptions = compilerOptions): ts.CompilerHost {
  const host = ts.createCompilerHost(tsCompilerOptions);

  host.getCurrentDirectory = () => {
    return rootDir();
  };
  host.getSourceFile = (fileName: string, languageVersion: ts.ScriptTarget,
                        onError?: (msg: string) => void): ts.SourceFile|
                       undefined => {
    cliSupport.assertAbsolute(fileName);
    // Normalize path to fix wrong directory separators on Windows which
    // would break the equality check.
    fileName = path.normalize(fileName);
    if (cachedLibs.has(fileName)) return cachedLibs.get(fileName);
    // Cache files in TypeScript's lib directory.
    if (fileName.startsWith(cachedLibDir)) {
      const sf = ts.createSourceFile(
          fileName, fs.readFileSync(fileName, 'utf8'), ts.ScriptTarget.Latest,
          true);
      cachedLibs.set(fileName, sf);
      return sf;
    }
    if (fileName === tslibPath()) {
      return ts.createSourceFile(
          fileName, fs.readFileSync(fileName, 'utf8'), ts.ScriptTarget.Latest,
          true);
    }
    const contents = sources.get(fileName);
    if (contents !== undefined) {
      return ts.createSourceFile(fileName, contents, ts.ScriptTarget.Latest, true);
    }
    throw new Error(`unexpected file read of ${fileName} not in ${
        Array.from(sources.keys())}`);
  };
  const originalFileExists = host.fileExists;
  host.fileExists = (fileName: string): boolean => {
    // Note that TS appears to sometimes ask about relative paths, but we only
    // store absolute paths, and we don't need to satisfy queries about relative
    // paths to be correct here.
    if (sources.has(fileName)) return true;
    if (fileName === tslibPath()) return true;
    // Typescript occasionally needs to look on disk for files we don't pass into
    // the program as a source (eg to resolve a module that's in node_modules),
    // but only .ts files explicitly passed in should be findable
    if (/\.ts$/.test(fileName)) {
      return false;
    }
    return originalFileExists.call(host, fileName);
  };

  // The default CompilerHost created by the compiler resolves symlinks.
  // We don't want to do that here. see also
  // https://github.com/Microsoft/TypeScript/pull/12020.
  host.realpath = (s: string): string => s;

  return host;
}

export function createProgramAndHost(
    sources: Map<string, string>,
    tsCompilerOptions: ts.CompilerOptions =
        compilerOptions): {host: ts.CompilerHost, program: ts.Program} {
  const host = createSourceCachingHost(sources);
  const program = ts.createProgram(Array.from(sources.keys()), tsCompilerOptions, host);
  return {program, host};
}

export class GoldenFileTest {
  /** Short name for test, from the directory name. */
  readonly name = path.basename(this.root);

  /**
   * @param root Absolute path to directory containing test.
   * @param tsPaths Relative paths from this.path to all .ts/.d.ts files in the
   *     test.
   */
  constructor(readonly root: string, private readonly tsPaths: string[]) {
    cliSupport.assertAbsolute(this.root);
  }

  /**
   * Returns the absolute path to where generated externs will be kept.
   */
  externsPath(): string {
    return path.join(this.root, 'externs.js');
  }

  /**
   * Returns absolute paths to "input" files: human-authored files, as distinct
   * from goldens.
   */
  inputPaths(): string[] {
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
  jsPaths(): string[] {
    return this.tsPaths.filter(f => !/\.d\.ts/.test(f))
        .map(f => path.join(this.root, GoldenFileTest.tsPathToJs(f)));
  }

  /**
   * Gets the absolute paths to the expected '.tsmes.' outputs of the test.
   */
  tsMigrationExportsShimPaths(): string[] {
    return this.tsPaths
        .map(
            (p) =>
                [p.replace('.ts', '.tsmes.d.ts'),
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
  get isDeclarationTest(): boolean {
    return /\.declaration\b/.test(this.name);
  }

  get isUntypedTest(): boolean {
    return /\.untyped\b/.test(this.name);
  }

  get isPureTransformerTest(): boolean {
    return /\.puretransform\b/.test(this.name);
  }

  get isNamespaceTransformationEnabled(): boolean {
    return !/\.no_nstransform\b/.test(this.name);
  }

  /** True if the test is testing es5 output; es6 output otherwise. */
  get isEs5Target(): boolean {
    return /\.es5\b/.test(this.name);
  }

  get hasShim(): boolean {
    return /\.shim\b/.test(this.name);
  }

  get isTsmesEnabledTest(): boolean {
    return !/\.tsmes_disabled\./.test(this.name);
  }

  static tsPathToJs(tsPath: string): string {
    return tsPath.replace(/\.tsx?$/, '.js');
  }
}

export function goldenTests(): GoldenFileTest[] {
  const basePath = path.join(rootDir(), 'test_files');
  const testNames = fs.readdirSync(basePath);

  let testDirs = testNames.map(testName => path.join(basePath, testName))
                     .filter(testDir => fs.statSync(testDir).isDirectory());
  if (!isInBazel()) {
    // TODO(nickreid): the migration shim code is incompatible with the open
    // source build.
    testDirs = testDirs.filter(
        testDir => !testDir.includes('ts_migration_exports_shim'));
  }
  let tests = testDirs.map(testDir => {
    let tsPaths = glob.sync(path.join(testDir, '**/*.ts'));
    tsPaths = tsPaths.concat(glob.sync(path.join(testDir, '*.tsx')));
    tsPaths = tsPaths.filter(p => !p.match(/\.(tsickle|decorated|tsmes)\./));
    const tsFiles = tsPaths.map(f => path.relative(testDir, f));
    tsFiles.sort();  // Source order is significant for externs concatenation after the test.
    return new GoldenFileTest(testDir, tsFiles);
  });

  if (process.env['TESTBRIDGE_TEST_ONLY']) {
    const re = new RegExp(process.env['TESTBRIDGE_TEST_ONLY']);
    tests = tests.filter(t => re.test(t.name));
    if (tests.length === 0) {
      console.error(`'--test_filter=${
          process.env['TESTBRIDGE_TEST_ONLY']}' did not match any tests`);
      process.exit(1);
    }
  }
  return tests;
}

/**
 * Returns absolute paths to every .d.ts in the test_files tree, for
 * verification by the e2e_clutz_dts_test.
 */
export function allDtsPaths(): string[] {
  return glob.sync(path.join(rootDir(), 'test_files', '**/*.d.ts'));
}

/**
 * A Jasmine "compare" function that compares the strings actual vs expected, and produces a human
 * readable, diff using diff-match-patch.
 */
function diffStrings(
    actual: {}, expected: {}): {pass: boolean, message?: string} {
  if (actual === expected) return {pass: true};
  if (typeof actual !== 'string' || typeof expected !== 'string') {
    return {
      pass: false,
      message: `toEqualWithDiff takes two strings, got ${actual}, ${expected}`
    };
  }
  const dmp = new DiffMatchPatch();
  dmp.Match_Distance = 0;
  dmp.Match_Threshold = 0;
  const diff = dmp.diff_main(expected, actual);
  dmp.diff_cleanupSemantic(diff);
  if (!diff.length) {
    return {pass: true};
  }

  let message =
      '\nStrings differ:\n\x1B[37;41m⌊missing expected content⌋\x1b[0m ' +
      '/ \x1B[90;42m⌈new actual content⌉\x1b[0m\n\n';
  for (const [diffKind, text] of diff) {
    switch (diffKind) {
      case DIFF_EQUAL:
        message += text;
        break;
      case DIFF_DELETE:
        // light gray on red.
        message += '\x1B[37;41m⌊' + text + '⌋\x1B[0m';
        break;
      case DIFF_INSERT:
        // dark gray on green.
        message += '\x1B[90;42m⌈' + text + '⌉\x1B[0m';
        break;
      default:
        throw new Error(`unexpected diff result: [${diffKind}, ${text}]`);
    }
  }
  return {pass: false, message};
}

// Augment the global "jasmine.Matchers" type with our toEqualWithDiff function.
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
export function addDiffMatchers() {
  jasmine.addMatchers({
    toEqualWithDiff() {
      return {compare: diffStrings};
    },
  });
}

export function formatDiagnostics(diags: ReadonlyArray<ts.Diagnostic>): string {
  // TODO(evanm): this should reuse the CompilerHost.
  const host: ts.FormatDiagnosticsHost = {
    getCurrentDirectory: () => rootDir(),
    getCanonicalFileName(filename: string) {
      return filename;
    },
    getNewLine() {
      return ts.sys.newLine;
    },
  };
  return ts.formatDiagnostics(diags, host);
}

/**
 * expectDiagnosticsEmpty is just
 *   expect(diags.length).toBe(0)
 * but prints some context if it fails.
 */
export function expectDiagnosticsEmpty(diags: ReadonlyArray<ts.Diagnostic>) {
  if (diags.length !== 0) {
    throw new Error(
        `Expected no diagnostics but got: ` + formatDiagnostics(diags));
  }
}

/**
 * Test-friendly wrapper of cliSupport.pathToModuleName.
 *
 * This wrapper special-cases the handling of the 'tslib' import to ensure the
 * test goldens always refer to it by its generic name (rather than some
 * environment-specific path).
 */
export function pathToModuleName(
    rootModulePath: string, context: string, fileName: string,
    options: ts.CompilerOptions, host: ts.ModuleResolutionHost): string {
  const resolved = ts.resolveModuleName(fileName, context, options, host);
  if (resolved && resolved.resolvedModule &&
      resolved.resolvedModule.resolvedFileName) {
    fileName = resolved.resolvedModule.resolvedFileName;
  }

  if (fileName === tslibPath()) return 'tslib';
  return cliSupport.pathToModuleName(rootModulePath, context, fileName);
}
