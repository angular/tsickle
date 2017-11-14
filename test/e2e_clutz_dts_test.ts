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

import {compileWithTransfromer, createProgram, goldenTests} from './test_support';

describe('clutz dts', () => {
  it('produces a valid .d.ts', () => {
    const tests = goldenTests().filter(t => t.isDeclarationTest);

    const dtsSources = new Map<string, string>();

    for (const test of tests) {
      for (const tsFile of test.tsFiles) {
        if (tsFile.endsWith('.d.ts')) {
          const tsPath = path.join(test.path, tsFile);
          const tsSource = fs.readFileSync(tsPath, 'utf-8');
          dtsSources.set(tsPath, tsSource);
        }
      }
    }

    const program = createProgram(dtsSources);
    const diagnostics = ts.getPreEmitDiagnostics(program);

    expect(diagnostics, tsickle.formatDiagnostics(diagnostics)).to.be.empty;
  });
});
