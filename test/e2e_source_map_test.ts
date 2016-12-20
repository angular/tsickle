/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assert, expect} from 'chai';
import * as path from 'path';
import {SourceMapConsumer} from 'source-map';
import * as ts from 'typescript';

import {Settings, toClosureJS} from '../src/main';
import {annotate} from '../src/tsickle';
import {toArray} from '../src/util';

import {createProgram} from './test_support';

describe('source maps', () => {
  it('composes source maps with tsc', function() {
    const diagnostics: ts.Diagnostic[] = [];

    const sources = new Map<string, string>();
    sources.set(ts.sys.resolvePath('input.ts'), `
      class X { field: number; }
      let x : string = 'a string';
      let y : string = 'another string';
      let z : string = x + y;`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const closure = toClosureJS(
        {sourceMap: true} as ts.CompilerOptions, ['input.ts'], {isUntyped: false} as Settings,
        diagnostics, sources);

    if (!closure) {
      assert.fail();
      return;
    }

    const compiledJS = getFileWithName('input.js', closure.jsFiles);

    if (!compiledJS) {
      assert.fail();
      return;
    }

    const lines = compiledJS.split('\n');
    const stringXLine = lines.findIndex(l => l.indexOf('a string') !== -1) + 1;
    const stringXColumn = lines[stringXLine - 1].indexOf('a string') + 1;
    const stringYLine = lines.findIndex(l => l.indexOf('another string') !== -1) + 1;
    const stringYColumn = lines[stringYLine - 1].indexOf('another string') + 1;

    const sourceMapJson: any = getFileWithName('input.js.map', closure.jsFiles);
    const sourceMap = new SourceMapConsumer(sourceMapJson);

    expect(sourceMap.originalPositionFor({line: stringXLine, column: stringXColumn}).line)
        .to.equal(3, 'first string definition');
    expect(sourceMap.originalPositionFor({line: stringXLine, column: stringXColumn}).source)
        .to.equal('input.ts', 'input file name');
    expect(sourceMap.originalPositionFor({line: stringYLine, column: stringYColumn}).line)
        .to.equal(4, 'second string definition');
    expect(sourceMap.originalPositionFor({line: stringYLine, column: stringYColumn}).source)
        .to.equal('input.ts', 'input file name');
  });

  it('composes sources maps with multiple input files', function() {
    const diagnostics: ts.Diagnostic[] = [];

    const sources = new Map<string, string>();
    sources.set(ts.sys.resolvePath('input1.ts'), `
      class X { field: number; }
      let x : string = 'a string';
      let y : string = 'another string';
      let z : string = x + y;`);

    sources.set(ts.sys.resolvePath('input2.ts'), `
      class A { field: number; }
      let a : string = 'third string';
      let b : string = 'fourth rate';
      let c : string = a + b;`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const closure = toClosureJS(
        {sourceMap: true, outFile: 'output.js'} as ts.CompilerOptions, ['input1.ts', 'input2.ts'],
        {isUntyped: false} as Settings, diagnostics, sources);

    if (!closure) {
      assert.fail();
      return;
    }

    const compiledJS = getFileWithName('output.js', closure.jsFiles);

    if (!compiledJS) {
      assert.fail();
      return;
    }

    const lines = compiledJS.split('\n');
    const stringXLine = lines.findIndex(l => l.indexOf('a string') !== -1) + 1;
    const stringXColumn = lines[stringXLine - 1].indexOf('a string') + 1;
    const stringBLine = lines.findIndex(l => l.indexOf('fourth rate') !== -1) + 1;
    ;
    const stringBColumn = lines[stringBLine - 1].indexOf('fourth rate') + 1;

    const sourceMapJson: any = getFileWithName('output.js.map', closure.jsFiles);
    const sourceMap = new SourceMapConsumer(sourceMapJson);
    expect(sourceMap.originalPositionFor({line: stringXLine, column: stringXColumn}).line)
        .to.equal(3, 'first string definition');
    expect(sourceMap.originalPositionFor({line: stringXLine, column: stringXColumn}).source)
        .to.equal('input1.ts', 'first input file');
    expect(sourceMap.originalPositionFor({line: stringBLine, column: stringBColumn}).line)
        .to.equal(4, 'fouth string definition');
    expect(sourceMap.originalPositionFor({line: stringBLine, column: stringBColumn}).source)
        .to.equal('input2.ts', 'second input file');
  });
});


function getFileWithName(filename: string, files: Map<string, string>): string|undefined {
  for (let filepath of toArray(files.keys())) {
    if (path.parse(filepath).base === filename) {
      return files.get(filepath);
    }
  }
}
