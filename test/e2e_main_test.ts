/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assert, expect} from 'chai';
import * as ts from 'typescript';

import {toClosureJS} from '../src/main';

import {compilerOptions, createSourceCachingHost, findFileContentsByName, readSources} from './test_support';

describe('toClosureJS', () => {
  it('creates externs, adds type comments and rewrites imports', () => {
    const diagnostics: ts.Diagnostic[] = [];

    const filePaths =
        ['test_files/underscore/export_underscore.ts', 'test_files/underscore/underscore.ts'];
    const sources = readSources(filePaths);

    const closure = toClosureJS(
        compilerOptions, filePaths, {isTyped: true}, diagnostics, createSourceCachingHost(sources));

    if (!closure) {
      diagnostics.forEach(v => console.log(JSON.stringify(v)));
      assert.fail();
      return;
    }

    expect(closure.externs).to.contain(`/** @const */
var __NS = {};
 /** @type {number} */
__NS.__ns1;
`);

    const underscoreDotJs =
        findFileContentsByName('test_files/underscore/underscore.js', closure.jsFiles);
    expect(underscoreDotJs).to.contain(`goog.module('test_files.underscore.underscore')`);
    expect(underscoreDotJs).to.contain(`/** @type {string} */`);

    const exportUnderscoreDotJs =
        findFileContentsByName('test_files/underscore/export_underscore.js', closure.jsFiles);
    expect(exportUnderscoreDotJs)
        .to.contain(`goog.module('test_files.underscore.export_underscore')`);
  });
});
