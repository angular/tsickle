/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import {getGeneratedExterns} from '../src/externs';
import {normalizeLineEndings} from '../src/jsdoc';
import * as tsickle from '../src/tsickle';

import * as testSupport from './test_support';

// Set TEST_FILTER=foo to only run tests from the foo package.
// Set TEST_FILTER=foo/bar to also filter for the '/bar' file.
const TEST_FILTER = (() => {
  if (!process.env.TEST_FILTER) return null;
  const [testName, fileName] = (process.env.TEST_FILTER as string).split('/', 2);
  return {
    testName: new RegExp(testName + (fileName ? '$' : '')),
    fileName: fileName ? new RegExp('/' + fileName) : null
  };
})();

// If true, update all the golden .js files to be whatever tsickle
// produces from the .ts source. Do not change this code but run as:
//     UPDATE_GOLDENS=y bazel run test:golden_test
const UPDATE_GOLDENS = !!process.env.UPDATE_GOLDENS;

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
function compareAgainstGolden(
    output: string|null, goldenPath: string, test: testSupport.GoldenFileTest) {
  let golden: string|null = null;
  try {
    golden = fs.readFileSync(goldenPath, 'utf-8');
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
    console.log('Updating golden file for', goldenPath);
    // If we need to write a new file, we won't have a symlink into the real
    // test_files directory, so we need to get an absolute path by combining
    // the relative path with the workspaceRoot
    const goldenSourcePath = path.join(test.getWorkspaceRoot(), goldenPath);
    if (output !== null) {
      fs.writeFileSync(goldenSourcePath, output, {encoding: 'utf-8'});
    } else {
      // The desired golden state is for there to be no output file.
      // Ensure no file exists.
      try {
        fs.unlinkSync(goldenSourcePath);
      } catch (e) {
        // ignore.
      }
    }
  } else {
    expect(output).toEqualWithDiff(golden!);
  }
}

// Only run golden tests if we filter for a specific one.
const testFn = TEST_FILTER ? fdescribe : describe;

testFn('golden tests with transformer', () => {
  beforeEach(() => {
    testSupport.addDiffMatchers();
  });

  testSupport.goldenTests().forEach((test) => {
    if (TEST_FILTER && !TEST_FILTER.testName.test(test.name)) {
      // do not xit(test.name) as that spams a lot of useless console msgs.
      return;
    }
    let emitDeclarations = true;
    if (test.name === 'fields') {
      emitDeclarations = false;
    }
    it(test.name, () => {
      expect(test.tsFiles.length).toBeGreaterThan(0);
      // Read all the inputs into a map, and create a ts.Program from them.
      const tsSources = new Map<string, string>();
      for (const tsFile of test.tsFiles) {
        // For .declaration tests, .d.ts's are goldens, not inputs
        if (/\.declaration\b/.test(test.name) && tsFile.endsWith('.d.ts')) {
          continue;
        }

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
          throw new Error(testSupport.formatDiagnostics(diagnostics));
        }
      }
      if (test.isEs5Target) {
        tsCompilerOptions.target = ts.ScriptTarget.ES5;
      }
      const allDiagnostics = new Set<ts.Diagnostic>();
      const transformerHost: tsickle.TsickleHost = {
        es5Mode: test.isEs5Target,
        googmodule: true,
        // See test_files/jsdoc_types/nevertyped.ts.
        typeBlackListPaths: new Set(['test_files/jsdoc_types/nevertyped.ts']),
        convertIndexImportShorthand: true,
        transformDecorators: !test.isPureTransformerTest,
        transformTypesToClosure: !test.isPureTransformerTest,
        addDtsClutzAliases: test.isDeclarationTest,
        untyped: test.isUntypedTest,
        provideExternalModuleDtsNamespace: !test.hasShim,
        logWarning: (diag: ts.Diagnostic) => {
          allDiagnostics.add(diag);
        },
        shouldSkipTsickleProcessing: (fileName) => !tsSources.has(fileName),
        shouldIgnoreWarningsForPath: () => false,
        pathToModuleName: (context, importPath) => {
          importPath = importPath.replace(/(\.d)?\.[tj]s$/, '');
          if (importPath[0] === '.') importPath = path.join(path.dirname(context), importPath);
          return importPath.replace(/\/|\\/g, '.').replace(/[^a-zA-Z$.0-9_]/g, '_');
        },
        fileNameToModuleId: (fileName) => fileName.replace(/^\.\//, ''),
        options: tsCompilerOptions,
        host: tsHost,
      };
      const tscOutput = new Map<string, string>();
      let targetSource: ts.SourceFile|undefined = undefined;
      if (TEST_FILTER && TEST_FILTER.fileName) {
        for (const [path] of tsSources.entries()) {
          if (!TEST_FILTER.fileName.test(path)) continue;
          if (targetSource) {
            throw new Error(
                `TEST_FILTER matches more than one file: ${targetSource.fileName} vs ${path}`);
          }
          targetSource = program.getSourceFile(path);
        }
        if (!targetSource) {
          throw new Error(`TEST_FILTER matched no file: ${TEST_FILTER.fileName} vs ${
              Array.from(tsSources.keys())}`);
        }
      }
      const {diagnostics, externs} = tsickle.emitWithTsickle(
          program, transformerHost, tsHost, tsCompilerOptions, targetSource,
          (fileName: string, data: string) => {
            if (test.isDeclarationTest) {
              // Only compare .d.ts files for declaration tests.
              if (!fileName.endsWith('.d.ts')) return;
            } else if (!fileName.endsWith('.js')) {
              // Only compare .js files for regular test runs (non-declaration).
              return;
            }
            // Normally we don't check .d.ts files, we are only interested to test that
            // we don't throw when we generate them, but if we're in a .declaration test,
            // we only care about the .d.ts files
            tscOutput.set(fileName, data);
          });
      for (const d of diagnostics) allDiagnostics.add(d);
      const diagnosticsByFile = new Map<string, ts.Diagnostic[]>();
      for (const d of allDiagnostics) {
        let diags = diagnosticsByFile.get(d.file!.fileName);
        if (!diags) diagnosticsByFile.set(d.file!.fileName, diags = []);
        diags.push(d);
      }
      if (!test.isDeclarationTest) {
        const sortedPaths = test.jsPaths.sort();
        const actualPaths = Array.from(tscOutput.keys()).map(p => p.replace(/^\.\//, '')).sort();
        expect(sortedPaths).toEqual(actualPaths, `${test.jsPaths} vs ${actualPaths}`);
      }
      let allExterns: string|null = null;
      if (!test.name.endsWith('.no_externs')) {
        // Concatenate externs for the files that are in this tests sources (but not other, shared
        // .d.ts files).
        const filteredExterns: {[k: string]: string} = {};
        let anyExternsGenerated = false;
        for (const fileName of tsSources.keys()) {
          if (externs[fileName]) {
            anyExternsGenerated = true;
            filteredExterns[fileName] = externs[fileName];
          }
        }
        if (anyExternsGenerated) allExterns = getGeneratedExterns(filteredExterns);
      }
      compareAgainstGolden(allExterns, test.externsPath, test);
      for (const [outputPath, output] of tscOutput) {
        const tsPath = outputPath.replace(/\.js$|\.d.ts$/, '.ts').replace(/^\.\//, '');
        const diags = diagnosticsByFile.get(tsPath);
        diagnosticsByFile.delete(tsPath);
        let out = output;
        if (diags) {
          out = testSupport.formatDiagnostics(diags)
                    .trim()
                    .split('\n')
                    .map(line => `// ${line}\n`)
                    .join('') +
              out;
        }
        compareAgainstGolden(out, outputPath, test);
      }
      const dtsDiags: ts.Diagnostic[] = [];
      if (diagnosticsByFile.size) {
        for (const [path, diags] of diagnosticsByFile.entries()) {
          if (path.endsWith('.d.ts')) {
            dtsDiags.push(...diags);
            continue;
          }
          expect(testSupport.formatDiagnostics(diags))
              .toBe('', `unhandled diagnostics for ${path}`);
        }
      }
      if (dtsDiags.length) {
        compareAgainstGolden(
            testSupport.formatDiagnostics(dtsDiags), path.join(test.path, 'dtsdiagnostics.txt'),
            test);
      }
    });
  });
});
