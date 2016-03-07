import {expect} from 'chai';
import * as ts from 'typescript';
import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';

import {SickleOptions, SickleOutput} from '../src/sickle';
import {annotate, formatDiagnostics} from '../src/sickle';

const OPTIONS: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES6,
  noImplicitAny: true,
  noResolve: true,
  skipDefaultLibCheck: true,
  noEmitOnError: true,
  experimentalDecorators: true,
  emitDecoratorMetadata: true,
};

const {cachedLibPath, cachedLib} = (function() {
  let host = ts.createCompilerHost(OPTIONS);
  let fn = host.getDefaultLibFileName(OPTIONS);
  let p = ts.getDefaultLibFilePath(OPTIONS);
  return {cachedLibPath: p, cachedLib: host.getSourceFile(fn, ts.ScriptTarget.ES6)};
})();

export function annotateSource(
    inputFileName: string, sourceText: string, options: SickleOptions = {}): SickleOutput {
  var host = ts.createCompilerHost(OPTIONS);
  var original = host.getSourceFile.bind(host);
  host.getSourceFile = function(
                           fileName: string, languageVersion: ts.ScriptTarget,
                           onError?: (msg: string) => void): ts.SourceFile {
    if (fileName === cachedLibPath) return cachedLib;
    if (fileName === inputFileName) {
      return ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.Latest, true);
    }
    return original(fileName, languageVersion, onError);
  };

  var program = ts.createProgram([inputFileName], OPTIONS, host);
  let diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length) {
    throw new Error(formatDiagnostics(diagnostics));
  }

  return annotate(program.getSourceFile(inputFileName), options);
}

export function transformSource(inputFileName: string, sourceText: string): string {
  var host = ts.createCompilerHost(OPTIONS);
  var original = host.getSourceFile.bind(host);
  var mainSrc = ts.createSourceFile(inputFileName, sourceText, ts.ScriptTarget.Latest, true);
  host.getSourceFile = function(
                           fileName: string, languageVersion: ts.ScriptTarget,
                           onError?: (msg: string) => void): ts.SourceFile {
    if (fileName === cachedLibPath) return cachedLib;
    if (fileName === inputFileName) {
      return mainSrc;
    }
    return original(fileName, languageVersion, onError);
  };

  var program = ts.createProgram([inputFileName], OPTIONS, host);
  let diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length) {
    throw new Error('Failed to parse ' + sourceText + '\n' + formatDiagnostics(diagnostics));
  }

  var transformed: {[fileName: string]: string} = {};
  var emitRes =
      program.emit(mainSrc, (fileName: string, data: string) => { transformed[fileName] = data; });
  if (emitRes.diagnostics.length) {
    throw new Error(formatDiagnostics(emitRes.diagnostics));
  }
  let outputFileName = inputFileName.replace('.ts', '.js');
  expect(Object.keys(transformed)).to.deep.equal([outputFileName]);
  return transformed[outputFileName];
}

export interface GoldenFileTest {
  name: string;
  // Path to input file.
  tsPath: string;
  // Path to golden of post-sickle processing.
  sicklePath: string;
  // Path to golden of post-sickle externs, if any.
  externsPath: string;
  // Path to golden of post-sickle, post TypeScript->ES6 processing.
  es6Path: string;
}

export function goldenTests(): GoldenFileTest[] {
  var testInputGlob = path.join(__dirname, '..', '..', 'test_files', '**', '*.in.ts');
  var testInputs = glob.sync(testInputGlob);
  return testInputs.map((testPath) => {
    let testName = testPath.match(/\/test_files\/(.*)\.in\.ts$/)[1];
    return {
      name: testName,
      tsPath: testPath,
      sicklePath: testPath.replace(/\.in\.ts$/, '.sickle.ts'),
      externsPath: testPath.replace(/\.in\.ts$/, '.sickle_externs.js'),
      es6Path: testPath.replace(/\.in\.ts$/, '.tr.js'),
    };
  });
}
