/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import * as ts from 'typescript';

import * as cliSupport from '../src/cli_support';
import * as es5processor from '../src/es5processor';
import * as tsickle from '../src/tsickle';
import {toArray} from '../src/util';

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
export function createProgram(sources: Map<string, string>): ts.Program {
  const host = ts.createCompilerHost(compilerOptions);

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

  return ts.createProgram(toArray(sources.keys()), compilerOptions, host);
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
