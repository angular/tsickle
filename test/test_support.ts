import {expect} from 'chai';
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

import {annotateProgram, formatDiagnostics, StringMap} from '../src/sickle';

const OPTIONS: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES6,
  noImplicitAny: true,
  noResolve: true,
  skipDefaultLibCheck: true,
};

const {cachedLibPath, cachedLib} = (function() {
  let host = ts.createCompilerHost(OPTIONS);
  let fn = host.getDefaultLibFileName(OPTIONS);
  let p = ts.getDefaultLibFilePath(OPTIONS);
  return {cachedLibPath: p, cachedLib: host.getSourceFile(fn, ts.ScriptTarget.ES6)};
})();

function annotateSource(src: string): string {
  var host = ts.createCompilerHost(OPTIONS);
  var original = host.getSourceFile.bind(host);
  host.getSourceFile = function(
                           fileName: string, languageVersion: ts.ScriptTarget,
                           onError?: (msg: string) => void): ts.SourceFile {
    if (fileName === cachedLibPath) return cachedLib;
    if (fileName === 'main.ts') {
      return ts.createSourceFile(fileName, src, ts.ScriptTarget.Latest, true);
    }
    return original(fileName, languageVersion, onError);
  };

  var program = ts.createProgram(['main.ts'], OPTIONS, host);
  if (program.getSyntacticDiagnostics().length) {
    throw new Error(formatDiagnostics(ts.getPreEmitDiagnostics(program)));
  }

  var res = annotateProgram(program);
  expect(Object.keys(res)).to.deep.equal(['main.ts']);
  return res['main.ts'];
}

function transformSource(src: string): string {
  var host = ts.createCompilerHost(OPTIONS);
  var original = host.getSourceFile.bind(host);
  var mainSrc = ts.createSourceFile('main.ts', src, ts.ScriptTarget.Latest, true);
  host.getSourceFile = function(
                           fileName: string, languageVersion: ts.ScriptTarget,
                           onError?: (msg: string) => void): ts.SourceFile {
    if (fileName === cachedLibPath) return cachedLib;
    if (fileName === 'main.ts') {
      return mainSrc;
    }
    return original(fileName, languageVersion, onError);
  };

  var program = ts.createProgram(['main.ts'], OPTIONS, host);
  if (program.getSyntacticDiagnostics().length) {
    throw new Error(formatDiagnostics(ts.getPreEmitDiagnostics(program)));
  }

  var transformed: StringMap = {};
  var emitRes =
      program.emit(mainSrc, (fileName: string, data: string) => { transformed[fileName] = data; });
  if (emitRes.diagnostics.length) {
    throw new Error(formatDiagnostics(emitRes.diagnostics));
  }
  expect(Object.keys(transformed)).to.deep.equal(['main.js']);
  return transformed['main.js'];
}

export function expectSource(src: string) {
  var annotated = annotateSource(src);
  // console.log('Annotated', annotated);
  var transformed = transformSource(annotated);
  return expect(transformed);
}

export interface GoldenFileTest {
  name: string;
  tsPath: string;
  jsPath: string;
}

export function goldenTests(): GoldenFileTest[] {
  var tsExtRe = /\.ts$/;
  var testFolder = path.join(__dirname, '..', '..', 'test_files');
  var files = fs.readdirSync(testFolder).filter((fn) => !!fn.match(tsExtRe));
  return files.map((fn) => {
    return {
      name: fn,
      tsPath: path.join(testFolder, fn),
      jsPath: path.join(testFolder, fn.replace(tsExtRe, '.js')),
    };
  });
}
