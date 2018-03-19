/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// tslint:disable:no-unused-expression mocha .to.be.empty getters.

import {expect} from 'chai';
import * as path from 'path';
import {RawSourceMap} from 'source-map';
import * as ts from 'typescript';

import {containsInlineSourceMap, getInlineSourceMapCount} from '../src/source_map_utils';
import * as tsickle from '../src/tsickle';

import {assertSourceMapping, compileWithTransfromer, extractInlineSourceMap, findFileContentsByName, generateOutfileCompilerOptions, getSourceMapWithName, inlineSourceMapCompilerOptions, sourceMapCompilerOptions} from './test_support';

describe('source maps with transformer', () => {
  it('composes source maps with tsc', () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', `
      class X { field: number; }
      let x : string = 'a string';
      let y : string = 'another string';
      let z : string = x + y;`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {files} = compileWithTransfromer(sources, sourceMapCompilerOptions);
    const compiledJs = files.get('input.js')!;
    const sourceMap = getSourceMapWithName('input.js.map', files);

    assertSourceMapping(compiledJs, sourceMap, 'a string', {line: 3, source: 'input.ts'});
    assertSourceMapping(compiledJs, sourceMap, 'another string', {line: 4, source: 'input.ts'});
  });

  it('composes sources maps with multiple input files', () => {
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
    const {files} = compileWithTransfromer(
        sources, {...sourceMapCompilerOptions, ...generateOutfileCompilerOptions('output.js')});
    const compiledJs = files.get('output.js')!;
    const sourceMap = getSourceMapWithName('output.js.map', files);

    assertSourceMapping(compiledJs, sourceMap, 'a string', {line: 3, source: 'input1.ts'});
    assertSourceMapping(compiledJs, sourceMap, 'fourth rate', {line: 4, source: 'input2.ts'});
  });

  it('handles files in different directories', () => {
    const sources = new Map<string, string>();
    sources.set('a/b/input1.ts', `
        class X { field: number; }
        let x : string = 'a string';
        let y : string = 'another string';
        let z : string = x + y;`);

    sources.set('a/c/input2.ts', `
        class A { field: number; }
        let a : string = 'third string';
        let b : string = 'fourth rate';
        let c : string = a + b;`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {files} = compileWithTransfromer(
        sources, {...sourceMapCompilerOptions, ...generateOutfileCompilerOptions('a/d/output.js')});
    const compiledJs = findFileContentsByName('a/d/output.js', files);
    const sourceMap = getSourceMapWithName('a/d/output.js.map', files);

    assertSourceMapping(compiledJs, sourceMap, 'a string', {line: 3, source: '../b/input1.ts'});
    assertSourceMapping(compiledJs, sourceMap, 'fourth rate', {line: 4, source: '../c/input2.ts'});
  });

  it('handles decorators correctly', () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', `/** @Annotation */
        function classAnnotation(t: any) { return t; }

        @classAnnotation
        class DecoratorTest {
          public methodName(s: string): string { return s; }
        }`);

    const {files} = compileWithTransfromer(sources, sourceMapCompilerOptions);
    const compiledJs = files.get('input.js')!;
    const sourceMap = getSourceMapWithName('input.js.map', files);

    assertSourceMapping(compiledJs, sourceMap, 'methodName', {line: 6, source: 'input.ts'});
  });

  it('composes inline sources', () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', `
      class X { field: number; }
      let x : string = 'a string';
      let y : string = 'another string';
      let z : string = x + y;`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {files} = compileWithTransfromer(
        sources, {...sourceMapCompilerOptions, ...inlineSourceMapCompilerOptions});
    const compiledJs = files.get('input.js')!;
    const sourceMap = extractInlineSourceMap(compiledJs);

    assertSourceMapping(compiledJs, sourceMap, 'a string', {line: 3, source: 'input.ts'});
    assertSourceMapping(compiledJs, sourceMap, 'another string', {line: 4, source: 'input.ts'});
  });

  it(`doesn't blow up trying to handle a source map in a .d.ts file`, () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', `
      class X { field: number; }
      let x : string = 'a string';
      let y : string = 'another string';
      let z : string = x + y;`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {files} = compileWithTransfromer(
        sources, {...sourceMapCompilerOptions, ...inlineSourceMapCompilerOptions});
    const compiledJs = files.get('input.js')!;
    const sourceMap = extractInlineSourceMap(compiledJs);
    const dts = files.get('input.d.ts')!;

    assertSourceMapping(compiledJs, sourceMap, 'a string', {line: 3, source: 'input.ts'});
    expect(dts).to.contain('declare let x: string;');
  });

  function createInputWithSourceMap(overrides: Partial<RawSourceMap> = {}): Map<string, string> {
    const sources = new Map<string, string>();
    const inputSourceMap = {
      'version': 3,
      'sources': ['original.ts'],
      'names': [],
      'mappings': 'AAAA,MAAM,EAAE,EAAE,CAAC',
      'file': 'intermediate.ts',
      'sourceRoot': '',
      ...overrides
    };
    const encodedSourceMap = Buffer.from(JSON.stringify(inputSourceMap), 'utf8').toString('base64');
    sources.set('intermediate.ts', `const x = 3;
//# sourceMappingURL=data:application/json;base64,${encodedSourceMap}`);
    return sources;
  }

  it('handles input source maps', () => {
    const sources = createInputWithSourceMap();

    const {files} = compileWithTransfromer(
        sources, {...sourceMapCompilerOptions, ...inlineSourceMapCompilerOptions});
    const compiledJs = files.get('intermediate.js')!;
    const sourceMap = extractInlineSourceMap(compiledJs);

    expect(getInlineSourceMapCount(compiledJs)).to.equal(1);
    assertSourceMapping(compiledJs, sourceMap, 'x = 3', {source: 'original.ts'});
  });

  it('handles input source maps with different file names than supplied to tsc', () => {
    const sources = createInputWithSourceMap({file: 'foo/bar/intermediate.ts'});
    const {files} = compileWithTransfromer(sources, sourceMapCompilerOptions);
    const compiledJs = files.get('intermediate.js')!;
    const sourceMap = getSourceMapWithName('intermediate.js.map', files);

    expect(getInlineSourceMapCount(compiledJs)).to.equal(0);
    assertSourceMapping(compiledJs, sourceMap, 'x = 3', {line: 1, source: 'original.ts'});
  });

  it('handles input source maps with an outDir different than the rootDir', () => {
    const sources = createInputWithSourceMap({file: 'foo/bar/intermediate.ts'});

    const {files} = compileWithTransfromer(sources, {
      ...sourceMapCompilerOptions,
      ...generateOutfileCompilerOptions('/out/output.js'),
      ...inlineSourceMapCompilerOptions
    });
    const compiledJs = findFileContentsByName('/out/output.js', files);
    const sourceMap = extractInlineSourceMap(compiledJs);

    assertSourceMapping(compiledJs, sourceMap, 'x = 3', {source: 'original.ts'});
  });

  it('removes incoming inline sourcemaps from the sourcemap content', () => {
    // make sure that not the whole file is mapped so that
    // sources of the intermediate file are present in the sourcemap.
    const sources = createInputWithSourceMap({'mappings': ';', 'sources': ['intermediate.ts']});

    const {files} = compileWithTransfromer(
        sources, {...sourceMapCompilerOptions, ...inlineSourceMapCompilerOptions});
    const compiledJs = files.get('intermediate.js')!;
    const sourceMap = extractInlineSourceMap(compiledJs);

    expect(sourceMap.sources[0]).to.eq('intermediate.ts');
    expect(containsInlineSourceMap(sourceMap.sourcesContent![0]))
        .to.eq(false, 'contains inline sourcemap');
  });

  it(`doesn't blow up putting an inline source map in an empty file`, () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', ``);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {files} = compileWithTransfromer(
        sources, {...sourceMapCompilerOptions, ...inlineSourceMapCompilerOptions});
    const compiledJs = files.get('input.js')!;
    const sourceMap = extractInlineSourceMap(compiledJs);

    expect(sourceMap).to.exist;
    expect(compiledJs).to.contain(`var module = module || {id: 'input.js'};`);
  });

  it(`handles mixed source mapped and non source mapped input`, () => {
    const sources = createInputWithSourceMap();
    sources.set('input2.ts', `
      class X { field: number; }
      let y : string = 'another string';
      let z : string = x + y;`);

    const {files} = compileWithTransfromer(
        sources, {...sourceMapCompilerOptions, ...generateOutfileCompilerOptions('output.js')});
    const compiledJs = files.get('output.js')!;
    const sourceMap = getSourceMapWithName('output.js.map', files);

    assertSourceMapping(compiledJs, sourceMap, 'x = 3', {source: 'original.ts'});
    assertSourceMapping(compiledJs, sourceMap, 'another string', {line: 3, source: 'input2.ts'});
  });

  it('maps at the start of lines correctly', () => {
    const sources = new Map([[
      'input.ts', `let x : number = 2;
      x + 1;
      let y = {z: 2};
      y.z;`
    ]]);

    const {files} = compileWithTransfromer(sources, sourceMapCompilerOptions);
    const compiledJs = files.get('input.js')!;
    const sourceMap = getSourceMapWithName('input.js.map', files);

    assertSourceMapping(
        compiledJs, sourceMap, 'let /** @type {number} */ x', {line: 1, source: 'input.ts'});
    assertSourceMapping(compiledJs, sourceMap, 'x + 1', {line: 2, source: 'input.ts'});
    assertSourceMapping(compiledJs, sourceMap, 'y.z', {line: 4, source: 'input.ts'});
  });
});
