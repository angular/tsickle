/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assert, expect} from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import {SourceMapConsumer} from 'source-map';
import * as ts from 'typescript';

import {Settings, toClosureJS} from '../src/main';
import {toArray} from '../src/util';

describe('main', () => {
  it('creates externs, adds type comments and rewrites imports', function() {
    const diagnostics: ts.Diagnostic[] = [];

    const closure = toClosureJS(
        {sourceMap: true, experimentalDecorators: true} as ts.CompilerOptions,
        ['test_files/underscore/export_underscore.ts', 'test_files/underscore/underscore.ts'], {isUntyped: false} as Settings, diagnostics);

    if (!closure) {
      diagnostics.forEach(v => console.log(JSON.stringify(v)));
      assert.fail();
      return {compiledJS: '', sourceMap: new SourceMapConsumer('' as any)};
    }

    const externsDotJSGolden = fs.readFileSync('test_files/underscore/externs.js', 'utf-8');
    expect(closure.externs).to.equal(externsDotJSGolden);

    const underscoreDotJs = closure.jsFiles.get('test_files/underscore/underscore.js');
    expect(underscoreDotJs).to.contain(`goog.module('test_files.underscore.underscore')`);
    expect(underscoreDotJs).to.contain(`/** @type {string} */`);

    const exportUnderscoreDotJs = closure.jsFiles.get('test_files/underscore/export_underscore.js');
    expect(exportUnderscoreDotJs).to.contain(`goog.module('test_files.underscore.export_underscore')`);
  });
});
