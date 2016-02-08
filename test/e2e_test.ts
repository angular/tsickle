import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import {expect} from 'chai';
import * as closure from 'google-closure-compiler';

import {goldenTests} from './test_support';

export function checkClosureCompile(jsFiles: string[], done: (err: Error) => void) {
  var startTime = Date.now();
  var total = jsFiles.length;
  if (!total) throw new Error('No JS files in ' + JSON.stringify(jsFiles));

  var CLOSURE_COMPILER_OPTS: closure.CompileOptions = {
    'checks-only': true,
    'jscomp_error': 'checkTypes',
    'js': jsFiles,
    'language_in': 'ECMASCRIPT6_STRICT',
  };

  var compiler = new closure.compiler(CLOSURE_COMPILER_OPTS);
  compiler.run((exitCode, stdout, stderr) => {
    console.log('Closure compilation:', total, 'done after', Date.now() - startTime, 'ms');
    let err: Error = null;
    if (exitCode != 0) {
      err = new Error(stderr);
    }
    done(err);
  });
}

describe('golden file tests', () => {
  it('generates correct Closure code', (done: (err: Error) => void) => {
    var goldenJs = goldenTests().map((t) => t.es6Path);
    checkClosureCompile(goldenJs, done);
  });
});
