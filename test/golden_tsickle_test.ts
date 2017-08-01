/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {expect} from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import * as tsickle from '../src/tsickle';
import {normalizeLineEndings, toArray} from '../src/util';

import * as testSupport from './test_support';

const TEST_FILTER: RegExp|null =
    process.env.TEST_FILTER ? new RegExp(process.env.TEST_FILTER) : null;

// If true, update all the golden .js files to be whatever tsickle
// produces from the .ts source. Do not change this code but run as:
//     UPDATE_GOLDENS=y gulp test
const UPDATE_GOLDENS = !!process.env.UPDATE_GOLDENS;

function readGolden(path: string): string|null {
  let golden: string|null = null;
  try {
    golden = fs.readFileSync(path, 'utf-8');
  } catch (e) {
    if (e.code === 'ENOENT') {
      return null;
    } else {
      throw e;
    }
  }
  return golden;
}

/**
 * compareAgainstGoldens compares a test output against the content in a golden
 * path, updating the content of the golden when UPDATE_GOLDENS is true.
 *
 * @param output The expected output, where the empty string indicates
 *    the file is expected to exist and be empty, while null indicates
 *    the file is expected to not exist.  (This subtlety is used for
 *    externs files, where the majority of tests are not expected to
 *    produce one.)
 */
function compareAgainstGolden(output: string|null, path: string) {
  let golden: string|null = null;
  try {
    golden = fs.readFileSync(path, 'utf-8');
  } catch (e) {
    if (e.code === 'ENOENT' && (UPDATE_GOLDENS || output === null)) {
      // A missing file is acceptable if we're updating goldens or
      // if we're expected to produce no output.
    } else {
      throw e;
    }
  }

  // Make sure we have proper line endings when testing on Windows.
  if (golden != null) golden = normalizeLineEndings(golden);
  if (output != null) output = normalizeLineEndings(output);

  if (UPDATE_GOLDENS && output !== golden) {
    console.log('Updating golden file for', path);
    if (output !== null) {
      fs.writeFileSync(path, output, {encoding: 'utf-8'});
    } else {
      // The desired golden state is for there to be no output file.
      // Ensure no file exists.
      try {
        fs.unlinkSync(path);
      } catch (e) {
        // ignore.
      }
    }
  } else {
    expect(output).to.equal(golden, `${path}`);
  }
}

// Only run golden tests if we filter for a specific one.
const testFn = TEST_FILTER ? describe.only : describe;

testFn('golden tests with transformer', () => {
  testSupport.goldenTests().forEach((test) => {
    if (TEST_FILTER && !TEST_FILTER.exec(test.name)) {
      it.skip(test.name);
      return;
    }
    let emitDeclarations = true;
    if (test.name === 'fields') {
      emitDeclarations = false;
    }
    it(test.name, () => {
      // Read all the inputs into a map, and create a ts.Program from them.
      const tsSources = new Map<string, string>();
      for (const tsFile of test.tsFiles) {
        const tsPath = path.join(test.path, tsFile);
        let tsSource = fs.readFileSync(tsPath, 'utf-8');
        tsSource = normalizeLineEndings(tsSource);
        tsSources.set(tsPath, tsSource);
      }
      const tsCompilerOptions: ts.CompilerOptions = {
        ...testSupport.compilerOptions,
        // Test that creating declarations does not throw
        declaration: emitDeclarations
      };
      const {program, host: tsHost} =
          testSupport.createProgramAndHost(tsSources, tsCompilerOptions);
      {
        const diagnostics = ts.getPreEmitDiagnostics(program);
        if (diagnostics.length) {
          throw new Error(tsickle.formatDiagnostics(diagnostics));
        }
      }
      const allDiagnostics: ts.Diagnostic[] = [];
      const diagnosticsByFile = new Map<string, ts.Diagnostic[]>();
      const transformerHost: tsickle.TsickleHost = {
        es5Mode: true,
        prelude: '',
        googmodule: true,
        // See test_files/jsdoc_types/nevertyped.ts.
        typeBlackListPaths: new Set(['test_files/jsdoc_types/nevertyped.ts']),
        convertIndexImportShorthand: true,
        transformDecorators: true,
        transformTypesToClosure: true,
        untyped: /\.untyped\b/.test(test.name),
        logWarning: (diag: ts.Diagnostic) => {
          allDiagnostics.push(diag);
          let diags = diagnosticsByFile.get(diag.file!.fileName);
          if (!diags) {
            diags = [];
            diagnosticsByFile.set(diag.file!.fileName, diags);
          }
          diags.push(diag);
        },
        shouldSkipTsickleProcessing: (fileName) => !tsSources.has(fileName),
        shouldIgnoreWarningsForPath: () => false,
        pathToModuleName: (context, importPath) => {
          importPath = importPath.replace(/(\.d)?\.[tj]s$/, '');
          if (importPath[0] === '.') importPath = path.join(path.dirname(context), importPath);
          return importPath.replace(/\/|\\/g, '.');
        },
        fileNameToModuleId: (fileName) => fileName.replace(/^\.\//, ''),
      };
      const jsSources: {[fileName: string]: string} = {};
      const {diagnostics, externs} = tsickle.emitWithTsickle(
          program, transformerHost, tsHost, tsCompilerOptions, undefined,
          (fileName: string, data: string) => {
            if (!fileName.endsWith('.d.ts')) {
              // Don't check .d.ts files, we are only interested to test
              // that we don't throw when we generate them.
              jsSources[fileName] = data;
            }
          });
      allDiagnostics.push(...diagnostics);
      let allExterns: string|null = null;
      if (!test.name.endsWith('.no_externs')) {
        for (const tsPath of toArray(tsSources.keys())) {
          if (externs[tsPath]) {
            if (!allExterns) allExterns = tsickle.EXTERNS_HEADER;
            allExterns += externs[tsPath];
          }
        }
      }
      compareAgainstGolden(allExterns, test.externsPath);
      Object.keys(jsSources).forEach(jsPath => {
        const tsPath = jsPath.replace(/\.js$/, '.ts').replace(/^\.\//, '');
        const diags = diagnosticsByFile.get(tsPath);
        diagnosticsByFile.delete(tsPath);
        let out = jsSources[jsPath];
        if (diags) {
          out = tsickle.formatDiagnostics(diags).split('\n').map(line => `// ${line}\n`).join('') +
              out;
        }
        compareAgainstGolden(out, jsPath);
      });
      const dtsDiags: ts.Diagnostic[] = [];
      if (diagnosticsByFile.size) {
        for (const [path, diags] of diagnosticsByFile.entries()) {
          if (path.endsWith('.d.ts')) {
            dtsDiags.push(...diags);
            continue;
          }
          expect(tsickle.formatDiagnostics(diags))
              .to.equal('', `unhandled diagnostics for ${path}`);
        }
      }
      if (dtsDiags.length) {
        compareAgainstGolden(
            tsickle.formatDiagnostics(dtsDiags), path.join(test.path, 'dtsdiagnostics.txt'));
      }
    });
  });
});
