/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as assert from 'assert';
import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import {SourceMapConsumer} from 'source-map';
import * as ts from 'typescript';

import * as cliSupport from '../src/cli_support';
import {BasicSourceMapConsumer, sourceMapTextToConsumer} from '../src/source_map_utils';
import * as tsickle from '../src/tsickle';
import {getCommonParentDirectory} from '../src/util';

/** Path to tslib.d.ts; used inside Google for this test suite. */
const tslibPath: string|null = null;

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
  paths: tslibPath ? {
    // The compiler builtin 'tslib' library is looked up by name,
    // so this entry controls which code is used for tslib.
    'tslib': [tslibPath]
  } :
                     undefined,
};

/** The TypeScript compiler options used by the test suite. */
export const compilerOptions: ts.CompilerOptions = {
  ...baseCompilerOptions,
  emitDecoratorMetadata: true,
  jsx: ts.JsxEmit.React,
  // Flags below are needed to make sure source paths are correctly set on write calls.
  rootDir: path.resolve(process.cwd()),
  outDir: '.',
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

  host.getSourceFile = (fileName: string, languageVersion: ts.ScriptTarget,
                        onError?: (msg: string) => void): ts.SourceFile|undefined => {
    // Normalize path to fix wrong directory separators on Windows which
    // would break the equality check.
    fileName = path.normalize(fileName);
    if (fileName === cachedLibPath) return cachedLib;
    if (tslibPath && fileName === tslibPath) {
      return ts.createSourceFile(
          fileName, fs.readFileSync(fileName, 'utf8'), ts.ScriptTarget.Latest, true);
    }
    if (path.isAbsolute(fileName)) fileName = path.relative(process.cwd(), fileName);
    const contents = sources.get(fileName);
    if (contents !== undefined) {
      return ts.createSourceFile(fileName, contents, ts.ScriptTarget.Latest, true);
    }
    throw new Error(
        'unexpected file read of ' + fileName + ' not in ' + Array.from(sources.keys()));
  };
  const originalFileExists = host.fileExists;
  host.fileExists = (fileName: string): boolean => {
    if (path.isAbsolute(fileName)) fileName = path.relative(process.cwd(), fileName);
    if (sources.has(fileName)) {
      return true;
    }
    if (tslibPath && fileName === tslibPath) return true;
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
  constructor(public path: string, public tsFiles: string[]) {}

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

  get isEs5Target(): boolean {
    return /\.es5\b/.test(this.name);
  }

  /**
   * Find the absolute path to the tsickle root directory by reading the
   * symlink bazel puts into bazel-bin back into the test_files directory
   * and chopping off the test_files portion.
   */
  getWorkspaceRoot(): string {
    if (!this.tsFiles.length || !this.tsFiles[0]) {
      throw new Error(
          'The workspace root was requested, but there were no source files to follow symlinks for.');
    }
    const resolvedFileSymLink = fs.readlinkSync(path.join(this.path, this.tsFiles[0]));
    const resolvedPathParts = resolvedFileSymLink.split(path.sep);
    const testFilesSegmentIndex = resolvedPathParts.findIndex(s => s === 'test_files');
    return path.join(path.sep, ...resolvedPathParts.slice(0, testFilesSegmentIndex));
  }

  static tsPathToJs(tsPath: string): string {
    return tsPath.replace(/\.tsx?$/, '.js');
  }
}

export function goldenTests(): GoldenFileTest[] {
  assert(process.env['RUNFILES']);
  const basePath = path.join(process.env['RUNFILES']!, 'tsickle', 'test_files');
  const testNames = fs.readdirSync(basePath);

  const testDirs = testNames.map(testName => path.join(basePath, testName))
                       .filter(testDir => fs.statSync(testDir).isDirectory());
  const tests = testDirs.map(testDir => {
    testDir = path.relative(process.cwd(), testDir);
    let tsPaths = glob.sync(path.join(testDir, '**/*.ts'));
    tsPaths = tsPaths.concat(glob.sync(path.join(testDir, '*.tsx')));
    tsPaths = tsPaths.filter(p => !p.match(/\.tsickle\./) && !p.match(/\.decorated\./));
    const tsFiles = tsPaths.map(f => path.relative(testDir, f));
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

export function assertSourceMapping(
    compiledJs: string, sourceMap: SourceMapConsumer, sourceSnippet: string,
    expectedPosition: {source: string, line?: number, column?: number}) {
  const {line, column} = getLineAndColumn(compiledJs, sourceSnippet);
  const originalPosition = sourceMap.originalPositionFor({line, column});
  if (expectedPosition.line) {
    expect(originalPosition.line).toBe(expectedPosition.line, 'original line number');
  }
  if (expectedPosition.column) {
    expect(originalPosition.column).toBe(expectedPosition.column, 'original column');
  }
  if (expectedPosition.source) {
    expect(originalPosition.source).toBe(expectedPosition.source, 'original source file');
  }
}

export function extractInlineSourceMap(source: string): BasicSourceMapConsumer {
  const inlineSourceMapRegex =
      new RegExp('//# sourceMappingURL=data:application/json;base64,(.*)$', 'mg');
  let previousResult: RegExpExecArray|null = null;
  let result: RegExpExecArray|null = null;
  // We want to extract the last source map in the source file
  // since that's probably the most recent one added.  We keep
  // matching against the source until we don't get a result,
  // then we use the previous result.
  do {
    previousResult = result;
    result = inlineSourceMapRegex.exec(source);
  } while (result !== null);
  const base64EncodedMap = previousResult![1];
  const sourceMapJson = Buffer.from(base64EncodedMap, 'base64').toString('utf8');
  return sourceMapTextToConsumer(sourceMapJson);
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

export function getSourceMapWithName(
    filename: string, files: Map<string, string>): BasicSourceMapConsumer {
  return sourceMapTextToConsumer(findFileContentsByName(filename, files));
}

/**
 * Add
 *   beforeEach(() => { testSupport.addDiffMatchers(); });
 * to your test to get colored diff output on expectation failures.
 */
export function addDiffMatchers() {
  // tslint:disable:no-require-imports
  jasmine.addMatchers(require('jasmine-diff')(jasmine, {
    colors: true,
    inline: true,
  }));
}

export function formatDiagnostics(diags: ReadonlyArray<ts.Diagnostic>): string {
  const host: ts.FormatDiagnosticsHost = {
    // TODO(evanm): do not depend on current directory here.
    getCurrentDirectory: ts.sys.getCurrentDirectory,
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

  const rootModulePath = rootPath ? rootPath : getCommonParentDirectory(fileNames);

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
