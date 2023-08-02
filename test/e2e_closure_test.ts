/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

///<reference types="jasmine"/>

import * as fs from 'fs';

import * as closure from './closure';
import * as testSupport from './test_support';
import {goldenTests} from './test_support';

describe('golden file tests', () => {
  beforeEach(() => {
    testSupport.addDiffMatchers();
  });
  it('compile with Closure', (done) => {
    // Declaration tests do not produce .js files.
    const tests = goldenTests().filter(t => !t.isDeclarationTest);
    // Collect all JavaScript outputs generated from .ts files.
    const goldenJs = ([] as string[]).concat(...tests.map(t => t.jsPaths()));
    // Manually add extra .js files that are not generated from .ts. Several tests include `.d.ts`
    // files describing symbols defined in JavaScript, e.g. for `goog:...` style Clutz imports.
    // These definitions must be included here so that Closure Compiler sees all definitions.
    goldenJs.push(
        'src/closure_externs.js',
        'third_party/tslib/externs.js',
        'third_party/tslib/tslib.js',
        'test/googbase_fake.js',
        'test_files/augment/shim.js',
        'test_files/clutz_type_value.no_externs/type_value.js',
        'test_files/clutz.no_externs/default_export.js',
        'test_files/clutz.no_externs/some_name_space.js',
        'test_files/clutz.no_externs/some_other.js',
        'test_files/declare_export_dts/shim.js',
        'test_files/declare_import/closure_default_export.js',
        'test_files/declare_import/closure_named_export.js',
        'test_files/declare_import/exporting.js',
        'test_files/declare/shim.js',
        'test_files/direct_externs_type_reference/shim.js',
        'test_files/export_equals.shim/shim.js',
        'test_files/fake_goog_reflect.js',
        'test_files/googmodule_esmodule.declaration.no_externs/some_module.js',
        'test_files/googmodule_esmodule.no_externs/some_module.js',
        'test_files/import_by_path.no_externs/jsprovides.js',
        'test_files/import_equals/exporter.js',
        'test_files/import_from_goog.no_externs/closure_LegacyModule.js',
        'test_files/import_from_goog.no_externs/closure_Module.js',
        'test_files/import_from_goog.no_externs/closure_OtherModule.js',
        'test_files/import_from_goog.no_externs/transitive_type.js',
        'test_files/no_dollar_type_reference.no_externs/closure_x.js',
        'test_files/no_dollar_type_reference.no_externs/closure_y.js',
        'test_files/type_propaccess.no_externs/nested_clazz.js',
    );
    const externs = tests.map(t => t.externsPath()).filter(fs.existsSync);
    const startTime = Date.now();
    const total = goldenJs.length;
    if (!total) throw new Error('No JS files in ' + JSON.stringify(goldenJs));

    const CLOSURE_FLAGS: closure.Flags = {
      // JSC_UNKNOWN_THIS runs during the CollapseProperties pass, so
      // it only fires if you have both:
      // - compilation_level=ADVANCED
      // - checks_only=false (the default)
      // with the latter setting, the compiler output is printed to stdout,
      // but we swallow the stdout below.
      'compilation_level': 'ADVANCED',
      'warning_level': 'VERBOSE',
      'js': goldenJs,
      'externs': externs,
      'language_in': 'ECMASCRIPT6_STRICT',
      'language_out': 'ECMASCRIPT5',
      'jscomp_off': ['lintChecks'],
      'jscomp_error': [
        'accessControls',
        'checkRegExp',
        'checkTypes',
        'checkVars',
        'conformanceViolations',
        'const',
        'constantProperty',
        'deprecated',
        'deprecatedAnnotations',
        'duplicateMessage',
        'es5Strict',
        'externsValidation',
        'functionParams',
        'globalThis',
        'invalidCasts',
        'misplacedTypeAnnotation',
        // disabled: @override currently not implemented by tsickle.
        // 'missingOverride',
        'missingPolyfill',
        'missingProperties',
        'missingProvide',
        'missingRequire',
        'missingReturn',
        'msgDescriptions',
        'nonStandardJsDocs',
        // disabled: too many false positives, not really a workable option.
        // 'reportUnknownTypes',
        'suspiciousCode',
        'strictModuleDepCheck',
        'typeInvalidation',
        'undefinedVars',
        'unknownDefines',
        // disabled: many tests do not use local vars.
        // 'unusedLocalVariables',
        'unusedPrivateMembers',
        'uselessCode',
        'underscore',
        'visibility',
      ],
      'conformance_configs': 'test_files/conformance.proto',
    };

    // Note: cannot use an async function here because tsetse crashes
    // if you have any async expression in the function body whose result
    // is unused(!).

    closure.compile({}, CLOSURE_FLAGS)
        .then(({exitCode, stdout, stderr}) => {
          const durationMs = Date.now() - startTime;
          console.error('Closure compilation of', total, 'files done after', durationMs, 'ms');
          // Some problems only print as warnings, without a way to promote them to errors.
          // So treat any stderr output as a reason to fail the test.
          // In JDK 9+, closure-compiler prints warnigns about unsafe access via reflection from
          // com.google.protobuf.UnsafeUtil. Ignore those.
          stderr = stderr.replace(/WARNING: .*\n/g, '');
          if (exitCode !== 0 || stderr.length > 0) {
            // expect() with a message abbreviates the text, so just emit
            // everything here.
            console.error(stderr);
            fail('Closure Compiler warned or errored');
          }
        })
        .catch(err => {
          expect(err).toBe(null);
        })
        .then(() => {
          done();
        });
  }, 60000 /* ms timeout */);
});
