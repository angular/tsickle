/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

///<reference types="jasmine"/>

import * as path from 'path';

import {toClosureJS} from '../src/main';
import * as tsickle from '../src/tsickle';

import * as testSupport from './test_support';

describe('toClosureJS', () => {
  beforeEach(() => {
    testSupport.addDiffMatchers();
  });
  it('creates externs, adds type comments and rewrites imports', () => {
    // Note: normally all paths that interact with the TS API must be absolute,
    // but this test is testing main.ts, which has its own logic for making
    // paths absolute.
    const filePaths = [
      'test_files/underscore/export_underscore.ts',
      'test_files/underscore/underscore.ts',
    ];
    // files is a map of rootDir-relative output paths to their contents.
    // We make the paths relative here so that the test assertions below can
    // look them up by their relative paths.
    const files = new Map<string, string>();
    const result = toClosureJS(
        testSupport.compilerOptions, filePaths, {isTyped: true},
        (filePath: string, contents: string) => {
          files.set(path.relative(testSupport.compilerOptions.rootDir!, filePath), contents);
        });

    testSupport.expectDiagnosticsEmpty(result.diagnostics);

    expect(tsickle.getGeneratedExterns(result.externs, testSupport.compilerOptions.rootDir!))
        .toContain(`/** @const */
var __NS = {};
/** @type {number} */
__NS.__ns1;`);

    const underscoreDotJs = files.get('test_files/underscore/underscore.js');
    expect(underscoreDotJs).toContain(`goog.module('test_files.underscore.underscore')`);
    expect(underscoreDotJs).toContain(`/** @type {string} */`);

    const exportUnderscoreDotJs = files.get('test_files/underscore/export_underscore.js');
    expect(exportUnderscoreDotJs)
        .toContain(`goog.module('test_files.underscore.export_underscore')`);
  });
});
