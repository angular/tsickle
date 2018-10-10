/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Install source-map-support so that stack traces are mapped back to TS code.
import 'source-map-support';

import * as assert from 'assert';
import {DIFF_DELETE, DIFF_EQUAL, DIFF_INSERT, diff_match_patch as DiffMatchPatch} from 'diff-match-patch';
import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import * as ts from 'typescript';

import * as cliSupport from '../src/cli_support';
import * as tsickle from '../src/tsickle';

/**
 * Return the 'root dir' under tests, which is the path to the image of
 * the source tree set up under the hermetic testing environment.
 */
function rootDir(): string {
  const runfiles = process.env['RUNFILES'];
  assert(runfiles);
  return path.join(runfiles!, 'tsickle');
}

/**
 * Absolute path to tslib.d.ts.
 *
 * The test suite runs the TS compiler, which wants to load tslib.
 * But bazel wants to run the test suite hermetically, so TS fails to find
 * tslib if we let it do its normal module resolution.  So instead we fix
 * the path here to the known path to the desired file.
 */
const tslibPath = path.join(rootDir(), 'node_modules/tslib/tslib.d.ts');

/** Base compiler options to be customized and exposed. */
export const baseCompilerOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2015,
  // Disable searching for @types typings. This prevents TS from looking
  // around for a node_modules directory.
  types: [],
  skipDefaultLibCheck: true,
  experimentalDecorators: true,
  module: ts.ModuleKind.CommonJS,
  strictNullChecks: true,
  noImplicitUseStrict: true,
  allowJs: false,
  importHelpers: true,
  noEmitHelpers: true,
  baseUrl: '.',
  paths: {
    // The compiler builtin 'tslib' library is looked up by name,
    // so this entry controls which code is used for tslib.
    'tslib': [tslibPath]
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

const {cachedLibPath, cachedLib} = (() => {
  const host = ts.createCompilerHost(baseCompilerOptions);
  const fn = host.getDefaultLibFileName(baseCompilerOptions);
  const p = ts.getDefaultLibFilePath(baseCompilerOptions);
  return {
    // Normalize path to fix mixed/wrong directory separators on Windows.
    cachedLibPath: path.normalize(p),
    cachedLib: host.getSourceFile(fn, baseCompilerOptions.target!),
  };
})();

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
                        onError?: (msg: string) => void): ts.SourceFile|undefined => {
    cliSupport.assertAbsolute(fileName);
    // Normalize path to fix wrong directory separators on Windows which
    // would break the equality check.
    fileName = path.normalize(fileName);
    if (fileName === cachedLibPath) return cachedLib;
    if (fileName === tslibPath) {
      return ts.createSourceFile(
          fileName, fs.readFileSync(fileName, 'utf8'), ts.ScriptTarget.Latest, true);
    }
    const contents = sources.get(fileName);
    if (contents !== undefined) {
      return ts.createSourceFile(fileName, contents, ts.ScriptTarget.Latest, true);
    }
    throw new Error(
        'unexpected file read of ' + fileName + ' not in ' + Array.from(sources.keys()));
  };
  const originalFileExists = host.fileExists;
  host.fileExists = (fileName: string): boolean => {
    cliSupport.assertAbsolute(fileName);
    if (sources.has(fileName)) return true;
    if (fileName === tslibPath) return true;
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

export function createProgramAndHost(
    sources: Map<string, string>, tsCompilerOptions: ts.CompilerOptions = compilerOptions):
    {host: ts.CompilerHost, program: ts.Program} {
  const host = createSourceCachingHost(sources);
  const program = ts.createProgram(Array.from(sources.keys()), tsCompilerOptions, host);
  return {program, host};
}

export class GoldenFileTest {
  constructor(
      /** Absolute path to directory containing test. */
      public path: string,
      /** Relative paths from this.path to source files in test. */
      public tsFiles: string[]) {
    cliSupport.assertAbsolute(this.path);
  }

  get name(): string {
    return path.basename(this.path);
  }

  get externsPath(): string {
    return path.join(this.path, 'externs.js');
  }

  get tsPaths(): string[] {
    return this.tsFiles.map(f => path.join(this.path, f));
  }

  get jsPaths(): string[] {
    return this.tsFiles.filter(f => !/\.d\.ts/.test(f))
        .map(f => path.join(this.path, GoldenFileTest.tsPathToJs(f)));
  }

  get isDeclarationTest(): boolean {
    return /\.declaration\b/.test(this.name);
  }

  get isUntypedTest(): boolean {
    return /\.untyped\b/.test(this.name);
  }

  get isPureTransformerTest(): boolean {
    return /\.puretransform\b/.test(this.name);
  }

  get isQuotingTest(): boolean {
    return /^quote_/.test(this.name);
  }

  /** True if the test is testing es5 output; es6 output otherwise. */
  get isEs5Target(): boolean {
    return /\.es5\b/.test(this.name);
  }

  get hasShim(): boolean {
    return /\.shim\b/.test(this.name);
  }

  static tsPathToJs(tsPath: string): string {
    return tsPath.replace(/\.tsx?$/, '.js');
  }
}

/**
 * Compute the absolute path to the source tree, outside of any bazel sandbox redirection.
 *
 * To update test golden files (including deleting them when necessary), we need the real path to
 * the source tree.
 */
export function getSourceRoot(): string {
  // The trick used here is to dereference a symlink for a file that is known to be present in
  // runfiles, then map the resulting path back the containing directory.
  const pathInSourceTree = 'node_modules/tslib/tslib.d.ts';
  const dereferencedPath = fs.readlinkSync(path.join(rootDir(), pathInSourceTree));
  return dereferencedPath.substr(0, dereferencedPath.length - pathInSourceTree.length - 1);
}

export function goldenTests(): GoldenFileTest[] {
  const basePath = path.join(rootDir(), 'test_files');
  const testNames = fs.readdirSync(basePath);

  const testDirs = testNames.map(testName => path.join(basePath, testName))
                       .filter(testDir => fs.statSync(testDir).isDirectory());
  const tests = testDirs.map(testDir => {
    let tsPaths = glob.sync(path.join(testDir, '**/*.ts'));
    tsPaths = tsPaths.concat(glob.sync(path.join(testDir, '*.tsx')));
    tsPaths = tsPaths.filter(p => !p.match(/\.tsickle\./) && !p.match(/\.decorated\./));
    const tsFiles = tsPaths.map(f => path.relative(testDir, f));
    tsFiles.sort();  // Source order is significant for externs concatenation after the test.
    return new GoldenFileTest(testDir, tsFiles);
  });

  return tests;
}

/**
 * Reads the files from the file system and returns a map from filePaths to
 * file contents.
 */
export function readSources(filePaths: string[]): Map<string, string> {
  const sources = new Map<string, string>();
  for (const filePath of filePaths) {
    sources.set(filePath, fs.readFileSync(filePath, {encoding: 'utf8'}));
  }
  return sources;
}

function getLineAndColumn(source: string, token: string): {line: number, column: number} {
  const idx = source.indexOf(token);
  if (idx === -1) {
    throw new Error(`Couldn't find token '${token}' in source ${source}`);
  }
  let line = 1, column = 0;
  for (let i = 0; i < idx; i++) {
    column++;
    if (source[i] === '\n') {
      line++;
      column = 0;
    }
  }
  return {line, column};
}

export function findFileContentsByName(filename: string, files: Map<string, string>): string {
  for (const filepath of files.keys()) {
    if (path.parse(filepath).base === path.parse(filename).base) {
      return files.get(filepath)!;
    }
  }
  assert(
      undefined,
      `Couldn't find file ${filename} in files: ${JSON.stringify(Array.from(files.keys()))}`);
  throw new Error('Unreachable');
}

function removed(str: string) {
  return '\x1B[37;41m' + str + '\x1B[0m';
}

function added(str: string) {
  return '\x1B[37;32m' + str + '\x1B[0m';
}

/**
 * A Jasmine "compare" function that compares the strings actual vs expected, and produces a human
 * readable, colored diff using diff-match-patch.
 */
function diffStrings(actual: {}, expected: {}) {
  if (actual === expected) return {pass: true};
  if (typeof actual !== 'string' || typeof expected !== 'string') {
    return {pass: false, message: `toEqualWithDiff takes two strings, got ${actual}, ${expected}`};
  }
  const dmp = new DiffMatchPatch();
  dmp.Match_Distance = 0;
  dmp.Match_Threshold = 0;
  const diff = dmp.diff_main(expected, actual);
  dmp.diff_cleanupSemantic(diff);
  if (!diff.length) return {pass: true};
  let message = '\x1B[0mstrings differ:\n';
  for (const [diffKind, text] of diff) {
    switch (diffKind) {
      case DIFF_EQUAL:
        message += text;
        break;
      case DIFF_DELETE:
        // light gray on red.
        message += '\x1B[37;41m' + text + '\x1B[0m';
        break;
      case DIFF_INSERT:
        // dark gray on green.
        message += '\x1B[90;42m' + text + '\x1B[0m';
        break;
      default:
        throw new Error('unexpected diff result: ' + [diffKind, text]);
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
    toEqualWithDiff(util: jasmine.MatchersUtil, cet: jasmine.CustomEqualityTester[]) {
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
    console.error(formatDiagnostics(diags));
    expect(diags.length).toBe(0);
  }
}

/**
 * Compiles with the transformer 'emitWithTsickle()', performing both decorator
 * downleveling and closurization.
 */
export function compileWithTransfromer(
    sources: Map<string, string>, compilerOptions: ts.CompilerOptions, rootPath?: string) {
  const fileNames = Array.from(sources.keys());
  const tsHost = createSourceCachingHost(sources, compilerOptions);
  const program = ts.createProgram(fileNames, compilerOptions, tsHost);
  expectDiagnosticsEmpty(ts.getPreEmitDiagnostics(program));

  const rootModulePath = rootPath ? rootPath : path.dirname(fileNames[0]);

  const transformerHost: tsickle.TsickleHost = {
    shouldSkipTsickleProcessing: (filePath) => !sources.has(filePath),
    pathToModuleName: cliSupport.pathToModuleName.bind(null, rootModulePath),
    shouldIgnoreWarningsForPath: (filePath) => false,
    fileNameToModuleId: (filePath) => filePath,
    transformDecorators: true,
    transformTypesToClosure: true,
    addDtsClutzAliases: true,
    googmodule: true,
    es5Mode: false,
    untyped: false,
    options: compilerOptions,
    host: tsHost,
  };

  const files = new Map<string, string>();
  const {diagnostics, externs} = tsickle.emitWithTsickle(
      program, transformerHost, tsHost, compilerOptions, undefined, (path, contents) => {
        files.set(path, contents);
      });

  expectDiagnosticsEmpty(diagnostics);
  return {files, externs};
}
