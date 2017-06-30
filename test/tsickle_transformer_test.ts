/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {expect} from 'chai';
import * as diff from 'diff';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import * as transformer from '../src/transformer';
import * as tsickle from '../src/tsickle';
import {toArray} from '../src/util';

import * as testSupport from './test_support';

const TEST_FILTER: RegExp|null =
    process.env.TEST_FILTER ? new RegExp(process.env.TEST_FILTER) : null;

// If true, update all the golden .transformer.patch files to be whatever tsickle
// produces from the .ts source. Do not change this code but run as:
//     UPDATE_TRANSFORMER_GOLDENS=y gulp test
const UPDATE_GOLDENS = !!process.env.UPDATE_TRANSFORMER_GOLDENS;

function calcPatchPath(path: string): string {
  return `${path}.transform.patch`;
}

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

function patchGolden(golden: string|null, path: string): string|null {
  if (golden == null) {
    return golden;
  }
  const patchPath = calcPatchPath(path);
  if (fs.existsSync(patchPath)) {
    // Note: the typings for `diff.applyPatch` are wrong in that the function
    // can also return `false`.
    const patchedGolden =
        diff.applyPatch(golden, fs.readFileSync(patchPath, 'utf-8')) as string | false;
    if (patchedGolden === false) {
      return golden;
    }
    return patchedGolden;
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
  const golden = readGolden(path);
  let patchedGolden = patchGolden(golden, path);

  // Make sure we have proper line endings when testing on Windows.
  if (patchedGolden != null) patchedGolden = patchedGolden.replace(/\r\n/g, '\n');
  if (output != null) output = output.replace(/\r\n/g, '\n');

  const patchPath = calcPatchPath(path);
  if (UPDATE_GOLDENS) {
    if (golden !== null && golden !== output) {
      console.log(`Updating golden patch file for ${path} with ${patchPath}`);
      const patchOutput =
          diff.createPatch(path, golden || '', output || '', 'golden', 'tsickle with transformer')!;
      fs.writeFileSync(patchPath, patchOutput, 'utf-8');
    } else {
      // The desired golden state is for there to be no output file.
      // Ensure no file exists.
      try {
        fs.unlinkSync(patchPath);
      } catch (e) {
        // ignore.
      }
    }
  } else {
    expect(output).to.equal(patchedGolden, `${path} with ${patchPath}`);
  }
}

const DIAGONSTIC_FILE_REGEX = /(test_files.*?):\s/;

function compareAgainstGoldenDiagnostics(diagnostics: ts.Diagnostic[], path: string) {
  // Munge the filenames in the diagnostics so that they don't include
  // the tsickle checkout path.
  for (const diag of diagnostics) {
    const fileName = diag.file.fileName;
    diag.file.fileName = fileName.substr(fileName.indexOf('test_files'));
  }
  const tsicklePath = path.replace(/((\.d)?\.tsx?)$/, '.tsickle$1');
  expect(tsicklePath).to.not.equal(path);
  const golden = patchGolden(readGolden(tsicklePath), tsicklePath) || '';
  const goldenFormattedDiagnostics =
      sortDiagnostics(golden.substring(0, golden.indexOf('\n====\n')));
  const outputFormattedDiagnostics = sortDiagnostics(
      tsickle.formatDiagnostics(diagnostics.filter(diag => diag.file.fileName === path)));

  expect(outputFormattedDiagnostics).to.equal(goldenFormattedDiagnostics, '<diagnostics>');
}

function sortDiagnostics(diagnostics: string): string {
  const lines = diagnostics.split('\n');
  return lines
      .sort((l1, l2) => {
        const m1 = DIAGONSTIC_FILE_REGEX.exec(l1) || [l1];
        const m2 = DIAGONSTIC_FILE_REGEX.exec(l2) || [l2];
        return m1[0].localeCompare(m2[0]);
      })
      .join('\n');
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
    const transfromerOptions: transformer.TransformerOptions = {
      // See test_files/jsdoc_types/nevertyped.ts.
      es5Mode: true,
      prelude: '',
      googmodule: true,
      typeBlackListPaths: new Set(['test_files/jsdoc_types/nevertyped.ts']),
      convertIndexImportShorthand: true,
      transformDecorators: true,
      transformTypesToClosure: true,
    };
    if (/\.untyped\b/.test(test.name)) {
      transfromerOptions.untyped = true;
    }
    if (test.name === 'fields') {
      emitDeclarations = false;
    }
    it(test.name, () => {
      // Read all the inputs into a map, and create a ts.Program from them.
      const tsSources = new Map<string, string>();
      for (const tsFile of test.tsFiles) {
        const tsPath = path.join(test.path, tsFile);
        let tsSource = fs.readFileSync(tsPath, 'utf-8');
        tsSource = tsSource.replace(/\r\n/g, '\n');
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
      const transformerHost: transformer.TransformerHost = {
        logWarning: (diag: ts.Diagnostic) => {
          allDiagnostics.push(diag);
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
      const {diagnostics, externs} = transformer.emitWithTsickle(
          program, transformerHost, transfromerOptions, tsHost, tsCompilerOptions, undefined,
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
        compareAgainstGolden(jsSources[jsPath], jsPath);
      });
      Array.from(tsSources.keys())
          .forEach(tsPath => compareAgainstGoldenDiagnostics(allDiagnostics, tsPath));
    });
  });
});
