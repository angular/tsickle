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
import * as testSupport from './test_support';

describe('clutz dts', () => {
  beforeEach(() => {
    testSupport.addDiffMatchers();
  });
  it('produces a valid .d.ts', () => {
    const tests = testSupport.goldenTests().filter(t => t.isDeclarationTest);

    const dtsSources = new Map<string, string>();

    for (const test of tests) {
      for (const tsPath of test.allDtsPaths()) {
        const tsSource = fs.readFileSync(tsPath, 'utf-8');
        dtsSources.set(tsPath, tsSource);
      }
    }

    const program = testSupport.createProgram(dtsSources);
    const diagnostics = ts.getPreEmitDiagnostics(program);

    testSupport.expectDiagnosticsEmpty(diagnostics);
  });
});
