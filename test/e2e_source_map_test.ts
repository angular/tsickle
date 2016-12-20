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
import {toArray} from '../src/util';

describe('source maps', () => {
  it('composes source maps with tsc', function() {
    const sources = new Map<string, string>();
    sources.set('input.ts', `
      class X { field: number; }
      let x : string = 'a string';
      let y : string = 'another string';
      let z : string = x + y;`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {compiledJS, sourceMap} = compile(sources);

    const {line: stringXLine, column: stringXColumn} = getLineAndColumn(compiledJS, 'a string');
    const {line: stringYLine, column: stringYColumn} = getLineAndColumn(compiledJS, 'another string');

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
    const sources = new Map<string, string>();
    sources.set('input1.ts', `
      class X { field: number; }
      let x : string = 'a string';
      let y : string = 'another string';
      let z : string = x + y;`);

    sources.set('input2.ts', `
      class A { field: number; }
      let a : string = 'third string';
      let b : string = 'fourth rate';
      let c : string = a + b;`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {compiledJS, sourceMap} = compile(sources);

    const {line: stringXLine, column: stringXColumn} = getLineAndColumn(compiledJS, 'a string');
    const {line: stringBLine, column: stringBColumn} = getLineAndColumn(compiledJS, 'fourth rate');

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

function getLineAndColumn(source: string, token: string): {line: number, column: number} {
  const lines = source.split('\n');
  const line = lines.findIndex(l => l.indexOf(token) !== -1) + 1;
  const column = lines[line - 1].indexOf(token) + 1;
  return {line, column};
}

function compile(sources: Map<string, string>): {compiledJS: string, sourceMap: SourceMapConsumer} {
  const resolvedSources = new Map<string, string>();
  for (const fileName of toArray(sources.keys())) {
    resolvedSources.set(ts.sys.resolvePath(fileName), sources.get(fileName));
  }

  const diagnostics: ts.Diagnostic[] = [];

  const closure = toClosureJS(
      {sourceMap: true, outFile: 'output.js'} as ts.CompilerOptions, toArray(sources.keys()),
      {isUntyped: false} as Settings, diagnostics, resolvedSources);

  if (!closure) {
    diagnostics.forEach(v => console.log(JSON.stringify(v)));
    assert.fail();
    return {compiledJS: '', sourceMap: new SourceMapConsumer('' as any)};
  }

  const compiledJS = getFileWithName('output.js', closure.jsFiles);

  if (!compiledJS) {
    assert.fail();
    return {compiledJS: '', sourceMap: new SourceMapConsumer('' as any)};
  }

  const sourceMapJson: any = getFileWithName('output.js.map', closure.jsFiles);
  const sourceMap = new SourceMapConsumer(sourceMapJson);

  return {compiledJS, sourceMap};
}

function getFileWithName(filename: string, files: Map<string, string>): string|undefined {
  for (let filepath of toArray(files.keys())) {
    if (path.parse(filepath).base === filename) {
      return files.get(filepath);
    }
  }
}
