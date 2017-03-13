/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as closure from 'google-closure-compiler';

import {goldenTests} from './test_support';

export function checkClosureCompile(
    jsFiles: string[], externsFiles: string[], done: (err?: Error) => void) {
  let startTime = Date.now();
  let total = jsFiles.length;
  if (!total) throw new Error('No JS files in ' + JSON.stringify(jsFiles));

  let CLOSURE_COMPILER_OPTS: closure.CompileOptions = {
    'checks_only': true,
    'jscomp_error': 'checkTypes',
    'js': jsFiles,
    'externs': externsFiles,
    'language_in': 'ECMASCRIPT6_STRICT',
    'language_out': 'ECMASCRIPT5',
  };

  let compiler = new closure.compiler(CLOSURE_COMPILER_OPTS);
  compiler.run((exitCode, stdout, stderr) => {
    console.log('Closure compilation:', total, 'done after', Date.now() - startTime, 'ms');
    if (exitCode !== 0) {
      done(new Error(stderr));
    } else {
      done();
    }
  });
}

describe('golden file tests', () => {
  it('generates correct Closure code', (done: (err?: Error) => void) => {
    let tests = goldenTests();
    let goldenJs = ([] as string[]).concat(...tests.map(t => t.jsPaths));
    goldenJs.push('test_files/clutz.no_externs/some_name_space.js');
    goldenJs.push('test_files/clutz.no_externs/some_other.js');
    goldenJs.push('test_files/import_from_goog/closure_Module.js');
    goldenJs.push('test_files/import_from_goog/closure_OtherModule.js');
    let externs = tests.map(t => t.externsPath).filter(fs.existsSync);
    checkClosureCompile(goldenJs, externs, done);
  });
});
