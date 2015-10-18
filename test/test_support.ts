import {expect} from 'chai';
import * as ts from 'typescript';
import {compile} from 'closure-compiler';

import {annotateProgram, formatDiagnostics, StringMap} from '../src/sickle';

const OPTIONS: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES6,
  noImplicitAny: true,
  noResolve: true,
  skipDefaultLibCheck: true,
};

const {cachedLibName, cachedLib} = (function() {
  let host = ts.createCompilerHost(OPTIONS);
  let fn = host.getDefaultLibFileName(OPTIONS);
  return {cachedLibName: fn, cachedLib: host.getSourceFile(fn, ts.ScriptTarget.ES6)};
})();

function annotateSource(src: string): string {
  var host = ts.createCompilerHost(OPTIONS);
  var original = host.getSourceFile.bind(host);
  host.getSourceFile = function(fileName: string, languageVersion: ts.ScriptTarget,
                                onError?: (msg: string) => void): ts.SourceFile {
    if (fileName === cachedLibName) return cachedLib;
    if (fileName === 'main.ts') {
      return ts.createSourceFile(fileName, src, ts.ScriptTarget.Latest, true);
    }
    return original(fileName, languageVersion, onError);
  };

  var program = ts.createProgram(['main.ts'], {}, host);
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
  host.getSourceFile = function(fileName: string, languageVersion: ts.ScriptTarget,
                                onError?: (msg: string) => void): ts.SourceFile {
    if (fileName === cachedLibName) return cachedLib;
    if (fileName === 'main.ts') {
      return mainSrc;
    }
    return original(fileName, languageVersion, onError);
  };

  var program = ts.createProgram(['main.ts'], {}, host);
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

export function checkClosureCompile(jsFiles: string[], done: (err: Error) => void) {
  var startTime = Date.now();
  var total = jsFiles.length;
  if (!total) throw new Error('No JS files in ' + JSON.stringify(jsFiles));

  var CLOSURE_COMPILER_OPTS: {[k: string]: string | string[]} = {
    'checks-only': null,
    'jscomp_error': 'checkTypes',
    'js': jsFiles,
    'language_in': 'ECMASCRIPT6'
  };

  compile(null, CLOSURE_COMPILER_OPTS, (err, stdout, stderr) => {
    // console.log('Closure compilation:', total, 'done after', Date.now() - startTime, 'ms');
    done(err);
  });
}

export function expectSource(src: string) {
  var annotated = annotateSource(src);
  // console.log('Annotated', annotated);
  var transformed = transformSource(annotated);
  return expect(transformed);
}
