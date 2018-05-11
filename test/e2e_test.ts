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

describe('golden file tests', () => {
  it('compile with Closure', (done) => {
    // Declaration tests do not produce .js files.
    const tests = goldenTests().filter(t => !t.isDeclarationTest);
    const goldenJs = ([] as string[]).concat(...tests.map(t => t.jsPaths));
    goldenJs.push('src/closure_externs.js');
    goldenJs.push('test_files/helpers.js');
    goldenJs.push('test_files/clutz.no_externs/some_name_space.js');
    goldenJs.push('test_files/clutz.no_externs/some_other.js');
    goldenJs.push('test_files/import_from_goog/closure_Module.js');
    goldenJs.push('test_files/import_from_goog/closure_OtherModule.js');
    goldenJs.push('test_files/export_equals/shim.js');
    goldenJs.push('test_files/type_propaccess.no_externs/nested_clazz.js');
    const externs = tests.map(t => t.externsPath).filter(fs.existsSync);
    const startTime = Date.now();
    const total = goldenJs.length;
    if (!total) throw new Error('No JS files in ' + JSON.stringify(goldenJs));

    const CLOSURE_COMPILER_OPTS: closure.CompileOptions = {
      'checks_only': true,
      'warning_level': 'VERBOSE',
      'js': goldenJs,
      'externs': externs,
      'language_in': 'ECMASCRIPT6_STRICT',
      'language_out': 'ECMASCRIPT5',
      'jscomp_off': ['lintChecks'],
      'jscomp_error': [
        'accessControls',
        'ambiguousFunctionDecl',
        'checkEventfulObjectDisposal',
        'checkRegExp',
        'checkTypes',
        'checkVars',
        'commonJsModuleLoad',
        'conformanceViolations',
        'const',
        'constantProperty',
        'deprecated',
        'deprecatedAnnotations',
        'duplicateMessage',
        'es3',
        'es5Strict',
        'externsValidation',
        'fileoverviewTags',
        'functionParams',
        'globalThis',
        'internetExplorerChecks',
        'invalidCasts',
        'misplacedTypeAnnotation',
        'missingGetCssName',
        // 'missingOverride',  // disabled: currently not implemented by tsickle.
        'missingPolyfill',
        'missingProperties',
        'missingProvide',
        'missingRequire',
        'missingReturn',
        'msgDescriptions',
        'nonStandardJsDocs',
        // 'reportUnknownTypes',  // disabled: too many positives, not really a workable option.
        'suspiciousCode',
        'strictModuleDepCheck',
        'typeInvalidation',
        'undefinedNames',
        'undefinedVars',
        'unknownDefines',
        'unusedLocalVariables',
        'unusedPrivateMembers',
        'uselessCode',
        'useOfGoogBase',
        'underscore',
        'visibility',
      ]
    };

    const compiler = new closure.compiler(CLOSURE_COMPILER_OPTS);
    compiler.run((exitCode, stdout, stderr) => {
      const durationMs = Date.now() - startTime;
      console.error('Closure compilation of', total, 'files done after', durationMs, 'ms');
      if (exitCode !== 0) {
        // expect() with a message abbreviates the text, so just emit everything here.
        console.error(stderr);
      }
      expect(exitCode).toBe(0, 'Closure Compiler exit code');
      done();
    });
  }, 60000 /* ms timeout */);
});
