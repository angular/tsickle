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
import * as tsickle from '../src/tsickle';

import {compilerOptions, createSourceCachingHost, findFileContentsByName, readSources} from './test_support';

describe('toClosureJS', () => {
  it('creates externs, adds type comments and rewrites imports', () => {
    const filePaths =
        ['test_files/underscore/export_underscore.ts', 'test_files/underscore/underscore.ts'];
    const sources = readSources(filePaths);

    const files = new Map<string, string>();
    const result = toClosureJS(
        compilerOptions, filePaths, {isTyped: true}, (filePath: string, contents: string) => {
          files.set(filePath, contents);
        });

    if (result.diagnostics.length || true) {
      // result.diagnostics.forEach(v => console.log(JSON.stringify(v)));
      expect(tsickle.formatDiagnostics(result.diagnostics)).to.equal('');
    }

    expect(tsickle.getGeneratedExterns(result.externs)).to.contain(`/** @const */
var __NS = {};
 /** @type {number} */
__NS.__ns1;
`);

    const underscoreDotJs = files.get('./test_files/underscore/underscore.js');
    expect(underscoreDotJs).to.contain(`goog.module('test_files.underscore.underscore')`);
    expect(underscoreDotJs).to.contain(`/** @type {string} */`);

    const exportUnderscoreDotJs = files.get('./test_files/underscore/export_underscore.js');
    expect(exportUnderscoreDotJs)
        .to.contain(`goog.module('test_files.underscore.export_underscore')`);
  });
});
