/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {expect} from 'chai';
import * as ts from 'typescript';

import {toClosureJS} from '../src/main';
import * as tsickle from '../src/tsickle';

import {compilerOptions, createHostWithSources, findFileContentsByName, readSources} from './test_support';

describe('toClosureJS', () => {
  it('creates externs, adds type comments and rewrites imports', () => {

    const filePaths =
        ['test_files/underscore/export_underscore.ts', 'test_files/underscore/underscore.ts'];
    const compilerOptionsWithRoot = {...compilerOptions, rootDir: 'test_files/', outDir: 'out/'};
    const sources = readSources(filePaths);

    const files = new Map<string, string>();
    // NB: the code below only passes underscore.ts, and then resolves export_underscore.
    const result = toClosureJS(
        compilerOptionsWithRoot, ['test_files/underscore/underscore.ts'], {isTyped: true},
        (filePath: string, contents: string) => {
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

    const underscoreDotJs = files.get('out/underscore/underscore.js');
    expect(underscoreDotJs).to.contain(`goog.module('underscore.underscore')`);
    expect(underscoreDotJs).to.contain(`goog.require('underscore.export_underscore')`);
    expect(underscoreDotJs).to.contain(`goog.forwardDeclare("underscore.export_underscore")`);
    expect(underscoreDotJs).to.contain(`/** @type {string} */`);

    const exportUnderscoreDotJs = files.get('out/underscore/export_underscore.js');
    expect(exportUnderscoreDotJs).to.contain(`goog.module('underscore.export_underscore')`);
  });
});
