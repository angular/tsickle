/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assert} from 'chai';
import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import {SourceMapConsumer} from 'source-map';
import * as ts from 'typescript';

import * as cliSupport from '../src/cli_support';
import * as es5processor from '../src/es5processor';
import {toClosureJS} from '../src/main';
import {sourceMapTextToConsumer} from '../src/source_map_utils';
import * as tsickle from '../src/tsickle';
import {createOutputRetainingCompilerHost, createSourceReplacingCompilerHost, toArray} from '../src/util';

/** The TypeScript compiler options used by the test suite. */
export const compilerOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2015,
  skipDefaultLibCheck: true,
  experimentalDecorators: true,
  emitDecoratorMetadata: true,
  noEmitHelpers: true,
  module: ts.ModuleKind.CommonJS,
  jsx: ts.JsxEmit.React,
  // Disable searching for @types typings. This prevents TS from looking
  // around for a node_modules directory.
  types: [],
  // Flags below are needed to make sure source paths are correctly set on write calls.
  rootDir: path.resolve(process.cwd()),
  outDir: '.',
  strictNullChecks: true,
  noImplicitUseStrict: true,
};

const {cachedLibPath, cachedLib} = (() => {
  const host = ts.createCompilerHost(compilerOptions);
  const fn = host.getDefaultLibFileName(compilerOptions);
  const p = ts.getDefaultLibFilePath(compilerOptions);
  return {
    // Normalize path to fix mixed/wrong directory separators on Windows.
    cachedLibPath: path.normalize(p),
    cachedLib: host.getSourceFile(fn, ts.ScriptTarget.ES2015)
  };
})();

/** Creates a ts.Program from a set of input files. */
export function createProgram(
    sources: Map<string, string>,
    tsCompilerOptions: ts.CompilerOptions = compilerOptions): ts.Program {
  return createProgramAndHost(sources, tsCompilerOptions).program;
}

export function createProgramAndHost(
    sources: Map<string, string>, tsCompilerOptions: ts.CompilerOptions = compilerOptions):
    {host: ts.CompilerHost, program: ts.Program} {
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


export function getLineAndColumn(source: string, token: string): {line: number, column: number} {
  const lines = source.split('\n');
  const line = lines.findIndex(l => l.indexOf(token) !== -1) + 1;
  if (line === 0) {
    throw new Error(`Couldn't find token '${token}' in source`);
  }
  const column = lines[line - 1].indexOf(token);
  return {line, column};
}

export interface CompilerOptions {
  useTransformer: boolean;
  /**
   * Controls the name of the file produced by the compiler.  If there's more
   * than one input file, they'll all be concatenated together in the outFile
   */
  outFile?: string;
  filesNotToProcess: Set<string>;
  inlineSourceMap: boolean;
  generateDTS: boolean;
}

const DEFAULT_COMPILER_OPTIONS = {
  filesNotToProcess: new Set<string>(),
  inlineSourceMap: false,
  generateDTS: false,
};

export function compile(
    sources: Map<string, string>,
    partialOptions: Partial<CompilerOptions>&{useTransformer: boolean}): {
  compiledJS: string,
  dts: string | undefined,
  sourceMap: SourceMapConsumer,
  sourceMapText: string
} {
  const options: CompilerOptions = {...DEFAULT_COMPILER_OPTIONS, ...partialOptions};
  const resolvedSources = new Map<string, string>();
  for (const fileName of toArray(sources.keys())) {
    resolvedSources.set(ts.sys.resolvePath(fileName), sources.get(fileName)!);
  }

  let compilerOptions: ts.CompilerOptions;
  if (options.inlineSourceMap) {
    compilerOptions = {
      inlineSourceMap: options.inlineSourceMap,
      inlineSources: true,
      outFile: options.outFile,
      experimentalDecorators: true,
      declaration: options.generateDTS,
    };
  } else {
    compilerOptions = {
      sourceMap: true,
      inlineSources: true,
      outFile: options.outFile,
      experimentalDecorators: true,
      declaration: options.generateDTS,
    };
  }

  const fileNames = toArray(sources.keys());

  const tsickleHost: tsickle.TsickleHost&tsickle.TransformerHost = {
    shouldSkipTsickleProcessing: (fileName) =>
        fileNames.indexOf(fileName) === -1 || options.filesNotToProcess.has(fileName),
    pathToModuleName: cliSupport.pathToModuleName,
    shouldIgnoreWarningsForPath: (filePath) => false,
    fileNameToModuleId: (fileName) => fileName,
  };

  const {jsFiles, diagnostics} = options.useTransformer ?
      compileWithTransfromer(resolvedSources, fileNames, tsickleHost, compilerOptions) :
      compileWithTsickleCompilerHost(resolvedSources, fileNames, tsickleHost, compilerOptions);

  if (diagnostics.length) {
    console.error(tsickle.formatDiagnostics(diagnostics));
    assert.fail();
    throw new Error('unreachable');
  }

  let compiledJSFileName = options.outFile;
  if (!compiledJSFileName) {
    if (sources.size === 1) {
      const inputFileName = sources.keys().next().value;
      compiledJSFileName = inputFileName.substring(0, inputFileName.length - 3) + '.js';
    } else {
      compiledJSFileName = 'input.js';
    }
  }
  const compiledJS = getFileWithName(compiledJSFileName, jsFiles);

  if (!compiledJS) {
    assert.fail(
        `Couldn't find file ${
                              compiledJSFileName
                            } in compilation output files: ${
                                                             JSON.stringify(toArray(jsFiles.keys()))
                                                           }`);
    throw new Error('unreachable');
  }

  let sourceMapJson: string;
  if (options.inlineSourceMap) {
    sourceMapJson = extractInlineSourceMap(compiledJS);
  } else {
    sourceMapJson = getFileWithName(compiledJSFileName + '.map', jsFiles) || '';
  }
  const sourceMap = sourceMapTextToConsumer(sourceMapJson);

  const dts = getFileWithName(
      compiledJSFileName.substring(0, compiledJSFileName.length - 3) + '.d.ts', jsFiles);

  return {compiledJS, dts, sourceMap, sourceMapText: sourceMapJson};
}

function extractInlineSourceMap(source: string): string {
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
  return Buffer.from(base64EncodedMap, 'base64').toString('utf8');
}

function getFileWithName(filename: string, files: Map<string, string>): string|undefined {
  for (const filepath of toArray(files.keys())) {
    if (path.parse(filepath).base === path.parse(filename).base) {
      return files.get(filepath);
    }
  }
  return undefined;
}

function compileWithTsickleCompilerHost(
    resolvedSources: Map<string, string>, fileNames: string[], tsickleHost: tsickle.TsickleHost,
    compilerOptions: ts.CompilerOptions):
    {jsFiles: Map<string, string>, diagnostics: ts.Diagnostic[]} {
  const closureJSOPtions = {
    files: resolvedSources,
    tsickleHost,
    tsicklePasses: [tsickle.Pass.DECORATOR_DOWNLEVEL, tsickle.Pass.CLOSURIZE],
  };

  const diagnostics: ts.Diagnostic[] = [];
  const closure =
      toClosureJS(compilerOptions, fileNames, {isTyped: true}, diagnostics, closureJSOPtions);
  return {jsFiles: closure ? closure.jsFiles : new Map<string, string>(), diagnostics};
}

function compileWithTransfromer(
    resolvedSources: Map<string, string>, fileNames: string[],
    transformerHost: tsickle.TransformerHost, compilerOptions: ts.CompilerOptions) {
  const jsFiles = new Map<string, string>();
  const tsHost = createSourceReplacingCompilerHost(
      resolvedSources,
      createOutputRetainingCompilerHost(jsFiles, ts.createCompilerHost(compilerOptions)));
  const program = ts.createProgram(fileNames, compilerOptions, tsHost);

  const allDiagnostics: ts.Diagnostic[] = [];
  allDiagnostics.push(...ts.getPreEmitDiagnostics(program));
  if (allDiagnostics.length === 0) {
    const {diagnostics} = tsickle.emitWithTsickle(
        program, transformerHost, {
          transformDecorators: true,
          transformTypesToClosure: true,
          googmodule: true,
          es5Mode: false,
          untyped: false,
        },
        tsHost, compilerOptions);
    allDiagnostics.push(...diagnostics);
  }
  return {jsFiles, diagnostics: allDiagnostics};
}