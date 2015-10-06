import {expect} from 'chai';
import * as ts from 'typescript';

import {transformProgram, formatDiagnostics} from '../src/tickle';

const OPTIONS: ts.CompilerOptions = {
  noImplicitAny: true,
  noResolve: true,
  skipDefaultLibCheck: true,
};

const {cachedLibName, cachedLib} = (function() {
  let host = ts.createCompilerHost(OPTIONS);
  let fn = host.getDefaultLibFileName(OPTIONS);
  return {cachedLibName: fn, cachedLib: host.getSourceFile(fn, ts.ScriptTarget.ES6)};
})();

function transformSource(src: string): string {
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

  var res = transformProgram(program);
  expect(Object.keys(res)).to.deep.equal(['main.ts']);
  return res['main.ts'];
}

function expectSource(src: string) {
  return expect(transformSource(src));
}

describe('adding JSDoc types', () => {
  it('handles variable declarations', () => {
    expectSource('var x: string;').to.equal('var /** string */ x: string;');
    expectSource('var x: string, y: number;')
        .to.equal('var /** string */ x: string, /** number */ y: number;');
  });
  it('handles function declarations', () => {
    expectSource('function x(a: number): string {\n' +
                 '  return "a";\n' +
                 '}')
        .to.equal(' /** @return { string} */function x( /** number */a: number): string {\n' +
                  '  return "a";\n' +
                  '}');
    expectSource('function x(a: number, b: number) {}')
        .to.equal('function x( /** number */a: number, /** number */ b: number) {}');
  });
  it('handles arrow functions', () => {
    expectSource('var x = (a: number): number => 12;')
        .to.equal('var x = /** @return { number} */ ( /** number */a: number): number => 12;');
  });
});
