import {expect} from 'chai';
import * as ts from 'typescript';
import * as glob from 'glob';
import * as path from 'path';

import * as sickle from '../src/sickle';

/** The TypeScript compiler options used by the test suite. */
const compilerOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES6,
  skipDefaultLibCheck: true,
  noEmitOnError: true,
  experimentalDecorators: true,
  emitDecoratorMetadata: true,
  noEmitHelpers: true,
  module: ts.ModuleKind.CommonJS,
};

const {cachedLibPath, cachedLib} = (function() {
  let host = ts.createCompilerHost(compilerOptions);
  let fn = host.getDefaultLibFileName(compilerOptions);
  let p = ts.getDefaultLibFilePath(compilerOptions);
  return {cachedLibPath: p, cachedLib: host.getSourceFile(fn, ts.ScriptTarget.ES6)};
})();

export function annotateSource(
    inputFileName: string, sourceText: string, options: sickle.Options = {}): sickle.Output {
  let host = ts.createCompilerHost(compilerOptions);
  let original = host.getSourceFile.bind(host);
  host.getSourceFile = function(
                           fileName: string, languageVersion: ts.ScriptTarget,
                           onError?: (msg: string) => void): ts.SourceFile {
    if (fileName === cachedLibPath) return cachedLib;
    if (fileName === inputFileName) {
      return ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.Latest, true);
    }
    return original(fileName, languageVersion, onError);
  };

  let program = ts.createProgram([inputFileName], compilerOptions, host);
  let diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length) {
    throw new Error(sickle.formatDiagnostics(diagnostics));
  }

  return sickle.annotate(program, program.getSourceFile(inputFileName), options);
}

export function transformSource(inputFileName: string, sourceText: string): string {
  let host = ts.createCompilerHost(compilerOptions);
  let original = host.getSourceFile.bind(host);
  let mainSrc = ts.createSourceFile(inputFileName, sourceText, ts.ScriptTarget.Latest, true);
  host.getSourceFile = function(
                           fileName: string, languageVersion: ts.ScriptTarget,
                           onError?: (msg: string) => void): ts.SourceFile {
    if (fileName === cachedLibPath) return cachedLib;
    if (fileName === inputFileName) {
      return mainSrc;
    }
    return original(fileName, languageVersion, onError);
  };

  let program = ts.createProgram([inputFileName], compilerOptions, host);
  let diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length) {
    throw new Error('Failed to parse ' + sourceText + '\n' + sickle.formatDiagnostics(diagnostics));
  }

  let transformed: {[fileName: string]: string} = {};
  let emitRes =
      program.emit(mainSrc, (fileName: string, data: string) => { transformed[fileName] = data; });
  if (emitRes.diagnostics.length) {
    throw new Error(sickle.formatDiagnostics(emitRes.diagnostics));
  }
  let outputFileName = inputFileName.replace('.ts', '.js');
  expect(Object.keys(transformed)).to.deep.equal([outputFileName]);
  let outputSource = transformed[outputFileName];

  function pathToModuleName(context: string, fileName: string): string {
    if (fileName[0] === '.') {
      fileName = path.join(path.dirname(context), fileName);
    }
    return fileName.replace(/^.+\/test_files\//, 'sickle_test/')
        .replace(/\.sickle\.js$/, '')
        .replace('/', '.');
  }
  return sickle.convertCommonJsToGoogModule(outputFileName, outputSource, pathToModuleName).output;
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
  let basePath = path.join(__dirname, '..', '..', 'test_files');
  let testInputs = glob.sync(path.join(basePath, '*.in.ts'));

  let tests = testInputs.map((testPath) => {
    let testName = testPath.match(/\/test_files\/(.*)\.in\.ts$/)[1];
    return {
      name: testName,
      tsPath: testPath,
      sicklePath: testPath.replace(/\.in\.ts$/, '.sickle.ts'),
      externsPath: testPath.replace(/\.in\.ts$/, '.sickle_externs.js'),
      es6Path: testPath.replace(/\.in\.ts$/, '.tr.js'),
    };
  });

  // export_helper*.ts is special, because it is imported by another
  // test.  It it must be importable as plain './export_helper' so its
  // files can't have extensions a ".in.ts" or ".tr.js".
  let helperInputs = glob.sync(path.join(basePath, 'export_helper{,_2}.ts'));
  for (let testPath of helperInputs) {
    let testName = testPath.match(/\/test_files\/(export_helper[^.]*)\.ts$/)[1];
    let exportHelperTestCase: GoldenFileTest = {
      name: testName,
      tsPath: testPath,
      sicklePath: testPath.replace(/\.ts$/, '.sickle.ts'),
      externsPath: testPath.replace(/\.ts$/, '.sickle_externs.js'),
      es6Path: testPath.replace(/\.ts$/, '.js'),
    };
    tests.push(exportHelperTestCase);
  }

  return tests;
}
