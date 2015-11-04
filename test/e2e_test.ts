import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import {expect} from 'chai';
import {CompileOptions, compile} from 'closure-compiler';

import {annotateProgram, formatDiagnostics} from '../src/sickle';
import {goldenTests} from './test_support';

export function checkClosureCompile(jsFiles: string[], done: (err: Error) => void) {
  var startTime = Date.now();
  var total = jsFiles.length;
  if (!total) throw new Error('No JS files in ' + JSON.stringify(jsFiles));

  var CLOSURE_COMPILER_OPTS: CompileOptions = {
    'checks-only': true,
    'jscomp_error': 'checkTypes',
    'js': jsFiles,
    'language_in': 'ECMASCRIPT6'
  };

  compile(null, CLOSURE_COMPILER_OPTS, (err, stdout, stderr) => {
    console.log('Closure compilation:', total, 'done after', Date.now() - startTime, 'ms');
    done(err);
  });
}

describe('golden file tests', () => {
  it('generates correct Closure code', (done: (err: Error) => void) => {
    var goldenJs = goldenTests().map((t) => t.jsPath);
    checkClosureCompile(goldenJs, done);
  });
});
