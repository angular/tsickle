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

import * as transformer from '../src/transformer';
import * as tsickle from '../src/tsickle';
import {normalizeLineEndings, toArray} from '../src/util';

import * as testSupport from './test_support';

const TEST_FILTER: RegExp|null =
    process.env.TEST_FILTER ? new RegExp(process.env.TEST_FILTER) : null;

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

// Only run golden tests if we filter for a specific one.
const testFn = TEST_FILTER ? describe.only : describe;

testFn('golden tests with transformer', () => {
  const variant = 'transformer';
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
      testSupport.compareAgainstGolden(allExterns, test.externsPath, variant);
      Object.keys(jsSources).forEach(jsPath => {
        testSupport.compareAgainstGolden(jsSources[jsPath], jsPath, variant);
      });
      const diagnosticMsgs = tsickle.formatDiagnostics(allDiagnostics) || null;
      testSupport.compareAgainstGolden(diagnosticMsgs, test.diagnosticsPath, variant);
    });
  });
});
