/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RawSourceMap} from 'source-map';

import {containsInlineSourceMap, getInlineSourceMapCount} from '../src/source_map_utils';

import {addDiffMatchers, assertSourceMapping, compileWithTransfromer, extractInlineSourceMap, findFileContentsByName, getSourceMapWithName, inlineSourceMapCompilerOptions, sourceMapCompilerOptions} from './test_support';

describe('source maps with transformer', () => {
  beforeEach(() => {
    addDiffMatchers();
  });
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
    expect(dts).toContain('declare let x: string;');
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

    expect(getInlineSourceMapCount(compiledJs)).toBe(1);
    assertSourceMapping(compiledJs, sourceMap, 'x = 3', {source: 'original.ts'});
  });

  it('handles input source maps with different file names than supplied to tsc', () => {
    const sources = createInputWithSourceMap({file: 'foo/bar/intermediate.ts'});
    const {files} = compileWithTransfromer(sources, sourceMapCompilerOptions);
    const compiledJs = files.get('intermediate.js')!;
    const sourceMap = getSourceMapWithName('intermediate.js.map', files);

    expect(getInlineSourceMapCount(compiledJs)).toBe(0);
    assertSourceMapping(compiledJs, sourceMap, 'x = 3', {line: 1, source: 'original.ts'});
  });

  it('handles input source maps with an outDir different than the rootDir', () => {
    const sources = createInputWithSourceMap({file: 'foo/bar/intermediate.ts'});

    const {files} = compileWithTransfromer(
        sources, {...sourceMapCompilerOptions, ...inlineSourceMapCompilerOptions});
    const compiledJs = findFileContentsByName('foo/bar/intermediate.js', files);
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

    expect(sourceMap.sources[0]).toBe('intermediate.ts');
    expect(containsInlineSourceMap(sourceMap.sourcesContent![0]))
        .toBe(false, 'contains inline sourcemap');
  });

  it(`doesn't blow up putting an inline source map in an empty file`, () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', ``);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {files} = compileWithTransfromer(
        sources, {...sourceMapCompilerOptions, ...inlineSourceMapCompilerOptions});
    const compiledJs = files.get('input.js')!;
    const sourceMap = extractInlineSourceMap(compiledJs);

    expect(sourceMap).toBeTruthy();
    expect(compiledJs).toContain(`var module = module || { id: 'input.ts' };`);
  });

  it(`handles mixed source mapped and non source mapped input`, () => {
    const sources = createInputWithSourceMap();
    sources.set('input2.ts', `
      class X { field: number; }
      let y : string = 'another string';
      let z : string = x + y;`);

    const {files} = compileWithTransfromer(sources, {...sourceMapCompilerOptions});

    const intermediateJs = files.get('intermediate.js')!;
    const intermediateJsMap = getSourceMapWithName('intermediate.js.map', files);
    assertSourceMapping(intermediateJs, intermediateJsMap, 'x = 3', {source: 'original.ts'});
    const input2Js = files.get('input2.js')!;
    const input2JsMap = getSourceMapWithName('input2.js.map', files);
    assertSourceMapping(input2Js, input2JsMap, 'another string', {line: 3, source: 'input2.ts'});
  });
});
