/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {toClosureJS} from '../src/main';
import * as tsickle from '../src/tsickle';

import * as testSupport from './test_support';

describe('toClosureJS', () => {
  beforeEach(() => {
    testSupport.addDiffMatchers();
  });
  it('creates externs, adds type comments and rewrites imports', () => {
    const filePaths = [
      'test_files/underscore/export_underscore.ts',
      'test_files/underscore/underscore.ts',
    ];
    const files = new Map<string, string>();
    const result = toClosureJS(
        testSupport.compilerOptions, filePaths, {isTyped: true},
        (filePath: string, contents: string) => {
          files.set(filePath, contents);
        });

    if (result.diagnostics.length || true) {
      // result.diagnostics.forEach(v => console.log(JSON.stringify(v)));
      expect(testSupport.formatDiagnostics(result.diagnostics)).toBe('');
    }

    expect(tsickle.getGeneratedExterns(result.externs)).toContain(`/** @const */
var __NS = {};
 /** @type {number} */
__NS.__ns1;
`);

    const underscoreDotJs = files.get('./test_files/underscore/underscore.js');
    expect(underscoreDotJs).toContain(`goog.module('test_files.underscore.underscore')`);
    expect(underscoreDotJs).toContain(`/** @type {string} */`);

    const exportUnderscoreDotJs = files.get('./test_files/underscore/export_underscore.js');
    expect(exportUnderscoreDotJs)
        .toContain(`goog.module('test_files.underscore.export_underscore')`);
  });
});
