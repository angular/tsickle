/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// tslint:disable:no-unused-expression mocha .to.be.empty getters.

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
      fs.writeFileSync(path, output, 'utf-8');
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
    expect(output).to.equal(golden, path);
  }
}

// Only run golden tests if we filter for a specific one.
const testFn = TEST_FILTER ? describe.only : describe;

testFn('golden tests with TsickleCompilerHost', () => {
  testFn('with separate passes', () => {
    runGoldenTests(true);
  });
  testFn('with one pass', () => {
    runGoldenTests(false);
  });
});

function runGoldenTests(useSeparatePasses: boolean) {
  testSupport.goldenTests().forEach((test) => {
    if (TEST_FILTER && !TEST_FILTER.exec(test.name)) {
      it.skip(test.name);
      return;
    }
    const options: tsickle.Options = {
      // See test_files/jsdoc_types/nevertyped.ts.
      typeBlackListPaths: new Set(['test_files/jsdoc_types/nevertyped.ts']),
    };
    if (/\.untyped\b/.test(test.name)) {
      options.untyped = true;
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
      let program = testSupport.createProgram(tsSources);
      {
        const diagnostics = ts.getPreEmitDiagnostics(program);
        if (diagnostics.length) {
          throw new Error(tsickle.formatDiagnostics(diagnostics));
        }
      }

      // Run TypeScript through the decorator annotator and emit goldens if
      // it changed anything.
      if (useSeparatePasses) {
        let convertDecoratorsMadeChange = false;
        for (const tsPath of toArray(tsSources.keys())) {
          // Run TypeScript through the decorator annotator and emit goldens if
          // it changed anything.
          const {output, diagnostics} =
              tsickle.convertDecorators(program.getTypeChecker(), program.getSourceFile(tsPath));
          expect(diagnostics).to.be.empty;
          if (output !== tsSources.get(tsPath)) {
            const decoratedPath = tsPath.replace(/.ts(x)?$/, '.decorated.ts$1');
            expect(decoratedPath).to.not.equal(tsPath);
            compareAgainstGolden(output, decoratedPath);
            tsSources.set(tsPath, output);
            convertDecoratorsMadeChange = true;
          }
        }
        if (convertDecoratorsMadeChange) {
          // A file changed; reload the program on the new output.
          program = testSupport.createProgram(tsSources);
        }
      }

      // Tsickle-annotate all the sources, comparing against goldens, and gather the
      // generated externs and tsickle-processed sources.
      let allExterns: string|null = null;
      const tsickleSources = new Map<string, string>();
      for (const tsPath of toArray(tsSources.keys())) {
        const warnings: ts.Diagnostic[] = [];
        options.logWarning = (diag: ts.Diagnostic) => {
          warnings.push(diag);
        };
        const annotatorHost: tsickle.AnnotatorHost = {
          logWarning: (diag: ts.Diagnostic) => {
            warnings.push(diag);
          },
          pathToModuleName: (context, importPath) => {
            importPath = importPath.replace(/(\.d)?\.[tj]s$/, '');
            if (importPath[0] === '.') importPath = path.join(path.dirname(context), importPath);
            return importPath.replace(/\/|\\/g, '.');
          }
        };
        // Run TypeScript through tsickle and compare against goldens.
        const sourceFile = program.getSourceFile(tsPath);
        const annotated = tsickle.annotate(
            program.getTypeChecker(), sourceFile, annotatorHost, options, {
              fileExists: ts.sys.fileExists,
              readFile: ts.sys.readFile,
            },
            testSupport.compilerOptions, undefined,
            useSeparatePasses ? tsickle.AnnotatorFeatures.Default :
                                tsickle.AnnotatorFeatures.LowerDecorators);
        const externs =
            tsickle.writeExterns(program.getTypeChecker(), sourceFile, annotatorHost, options);
        const diagnostics = externs.diagnostics.concat(annotated.diagnostics);
        if (externs.output && !test.name.endsWith('.no_externs')) {
          if (!allExterns) allExterns = tsickle.EXTERNS_HEADER;
          allExterns += externs.output;
        }

        // If there were any diagnostics, convert them into strings for
        // the golden output.
        let fileOutput = annotated.output;
        diagnostics.push(...warnings);
        if (diagnostics.length > 0) {
          // Munge the filenames in the diagnostics so that they don't include
          // the tsickle checkout path.
          for (const diag of diagnostics) {
            if (diag.file) {
              const fileName = diag.file.fileName;
              diag.file.fileName = fileName.substr(fileName.indexOf('test_files'));
            }
          }
          fileOutput = tsickle.formatDiagnostics(diagnostics) + '\n====\n' + annotated.output;
        }
        const tsicklePath = tsPath.replace(/((\.d)?\.tsx?)$/, '.tsickle$1');
        expect(tsicklePath).to.not.equal(tsPath);
        if (useSeparatePasses) {
          // Don't compare the output of tsickle if we
          // do a single pass as whitespaces might be different.
          compareAgainstGolden(fileOutput, tsicklePath);
        }
        tsickleSources.set(tsPath, annotated.output);
      }
      compareAgainstGolden(allExterns, test.externsPath);

      // Run tsickled TypeScript through TypeScript compiler
      // and compare against goldens.
      program = testSupport.createProgram(tsickleSources);
      const jsSources = testSupport.emit(program);
      for (const jsPath of Object.keys(jsSources)) {
        compareAgainstGolden(jsSources[jsPath], jsPath);
      }
    });
  });
}
