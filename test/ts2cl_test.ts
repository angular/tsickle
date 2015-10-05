import {expect} from 'chai';
import * as ts from 'typescript';

import {transformProgram} from '../src/ts2cl';

const OPTIONS: ts.CompilerOptions = {};

function transformSource(src: string): string {
  var host = ts.createCompilerHost(OPTIONS);
  var original = host.getSourceFile.bind(host);
  host.getSourceFile = function(fileName: string, languageVersion: ts.ScriptTarget,
                                onError?: (msg: string) => void): ts.SourceFile {
    if (fileName === 'main.ts') {
      return ts.createSourceFile(fileName, src, ts.ScriptTarget.Latest, true);
    }
    return original(fileName, languageVersion, onError);
  };
  var program = ts.createProgram(['main.ts'], {}, host);
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
});
