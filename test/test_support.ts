/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assert, expect} from 'chai';
import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import {BasicSourceMapConsumer, SourceMapConsumer} from 'source-map';
import * as ts from 'typescript';

import * as cliSupport from '../src/cli_support';
import * as es5processor from '../src/es5processor';
import {toClosureJS} from '../src/main';
import {sourceMapTextToConsumer} from '../src/source_map_utils';
import * as tsickle from '../src/tsickle';
import {createOutputRetainingCompilerHost, toArray} from '../src/util';

/** Base compiler options to be customized and exposed. */
const baseCompilerOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2015,
  // Disable searching for @types typings. This prevents TS from looking
  // around for a node_modules directory.
  types: [],
  skipDefaultLibCheck: true,
  experimentalDecorators: true,
  module: ts.ModuleKind.CommonJS,
  strictNullChecks: true,
  noImplicitUseStrict: true,
};

/** The TypeScript compiler options used by the test suite. */
export const compilerOptions: ts.CompilerOptions = {
  ...baseCompilerOptions,
  emitDecoratorMetadata: true,
  noEmitHelpers: true,
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
 * Compose with sourceMapCompiler options if you want to specify an outFile.
 *
 * Controls the name of the file produced by the compiler.  If there's more
 * than one input file, they'll all be concatenated together in the outFile
 */
export function generateOutfileCompilerOptions(outFile: string): ts.CompilerOptions {
  return {
    outFile,
    module: ts.ModuleKind.None,
  };
}

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
                        onError?: (msg: string) => void): ts.SourceFile => {
    // Normalize path to fix wrong directory separators on Windows which
    // would break the equality check.
    fileName = path.normalize(fileName);
    if (fileName === cachedLibPath) return cachedLib;
    if (path.isAbsolute(fileName)) fileName = path.relative(process.cwd(), fileName);
    const contents = sources.get(fileName);
    if (contents !== undefined) {
      return ts.createSourceFile(fileName, contents, ts.ScriptTarget.Latest, true);
    }
    throw new Error('unexpected file read of ' + fileName + ' not in ' + toArray(sources.keys()));
  };
  const originalFileExists = host.fileExists;
  host.fileExists = (fileName: string): boolean => {
    if (path.isAbsolute(fileName)) fileName = path.relative(process.cwd(), fileName);
    if (sources.has(fileName)) {
      return true;
    }
    return originalFileExists.call(host, fileName);
  };

  return host;
}

export function createProgramAndHost(
    sources: Map<string, string>, tsCompilerOptions: ts.CompilerOptions = compilerOptions):
    {host: ts.CompilerHost, program: ts.Program} {
  const host = createSourceCachingHost(sources);

  const program = ts.createProgram(toArray(sources.keys()), tsCompilerOptions, host);
  return {program, host};
}

/** Emits transpiled output with tsickle postprocessing.  Throws an exception on errors. */
export function emit(program: ts.Program): {[fileName: string]: string} {
  const transformed: {[fileName: string]: string} = {};
  const {diagnostics} = program.emit(undefined, (fileName: string, data: string) => {
    const options: es5processor.Es5ProcessorOptions = {es5Mode: true, prelude: ''};
    const host: es5processor.Es5ProcessorHost = {
      fileNameToModuleId: (fn) => fn.replace(/^\.\//, ''),
      pathToModuleName: cliSupport.pathToModuleName
    };
    transformed[fileName] = es5processor.processES5(host, options, fileName, data).output;
  });
  if (diagnostics.length > 0) {
    throw new Error(tsickle.formatDiagnostics(diagnostics));
  }
  return transformed;
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

  public static tsPathToJs(tsPath: string): string {
    return tsPath.replace(/\.tsx?$/, '.js');
  }
}

export function goldenTests(): GoldenFileTest[] {
  const basePath = path.join(__dirname, '..', '..', 'test_files');
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
  const lines = source.split('\n');
  const line = lines.findIndex(l => l.indexOf(token) !== -1) + 1;
  if (line === 0) {
    throw new Error(`Couldn't find token '${token}' in source`);
  }
  const column = lines[line - 1].indexOf(token);
  return {line, column};
}

export function assertSourceMapping(
    compiledJs: string, sourceMap: SourceMapConsumer, sourceSnippet: string,
    expectedPosition: {line?: number, column?: number, source?: string}) {
  const {line, column} = getLineAndColumn(compiledJs, sourceSnippet);
  const originalPosition = sourceMap.originalPositionFor({line, column});
  if (expectedPosition.line) {
    expect(originalPosition.line).to.equal(expectedPosition.line);
  }
  if (expectedPosition.column) {
    expect(originalPosition.column).to.equal(expectedPosition.column);
  }
  if (expectedPosition.source) {
    expect(originalPosition.source).to.equal(expectedPosition.source);
  }
}

export function createTsickleHost(
    sources: Map<string, string>,
    filesNotToProcess = new Set<string>()): tsickle.TsickleHost&tsickle.TransformerHost {
  return {
    shouldSkipTsickleProcessing: (fileName) =>
        !sources.has(fileName) || filesNotToProcess.has(fileName),
    pathToModuleName: cliSupport.pathToModuleName,
    shouldIgnoreWarningsForPath: (filePath) => false,
    fileNameToModuleId: (fileName) => fileName,
  };
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
  const filePaths = toArray(files.keys());
  for (const filepath of filePaths) {
    if (path.parse(filepath).base === path.parse(filename).base) {
      return files.get(filepath)!;
    }
  }
  assert(undefined, `Couldn't find file ${filename} in files: ${JSON.stringify(filePaths)}`);
  throw new Error('Unreachable');
}

export function getSourceMapWithName(
    filename: string, files: Map<string, string>): BasicSourceMapConsumer {
  return sourceMapTextToConsumer(findFileContentsByName(filename, files));
}

/**
 * Compiles with the transformer 'emitWithTsickle()', performing both decorator
 * downleveling and closurization.
 */
export function compileWithTransfromer(
    sources: Map<string, string>, compilerOptions: ts.CompilerOptions) {
  const fileNames = toArray(sources.keys());
  const files = new Map<string, string>();
  const tsHost =
      createOutputRetainingCompilerHost(files, createSourceCachingHost(sources, compilerOptions));
  const program = ts.createProgram(fileNames, compilerOptions, tsHost);
  expect(ts.getPreEmitDiagnostics(program))
      .lengthOf(0, tsickle.formatDiagnostics(ts.getPreEmitDiagnostics(program)));

  const {diagnostics, externs} = tsickle.emitWithTsickle(
      program, createTsickleHost(sources), {
        transformDecorators: true,
        transformTypesToClosure: true,
        googmodule: true,
        es5Mode: false,
        untyped: false,
      },
      tsHost, compilerOptions);

  // tslint:disable-next-line:no-unused-expression
  expect(diagnostics, tsickle.formatDiagnostics(diagnostics)).to.be.empty;
  return {files, externs};
}
