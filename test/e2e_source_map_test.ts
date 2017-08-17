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

import {convertDecorators} from '../src/decorator-annotator';
import {containsInlineSourceMap, DefaultSourceMapper, getInlineSourceMapCount, parseSourceMap, setInlineSourceMap} from '../src/source_map_utils';
import * as tsickle from '../src/tsickle';
import {toArray} from '../src/util';

import {compile, createProgram, getLineAndColumn} from './test_support';

describe('source maps with TsickleCompilerHost', () => {
  createTests(false);
});
describe('source maps with transformer', () => {
  createTests(true);
});

function createTests(useTransformer: boolean) {
  it('composes source maps with tsc', () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', `
      class X { field: number; }
      let x : string = 'a string';
      let y : string = 'another string';
      let z : string = x + y;`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {compiledJS, sourceMap} = compile(sources, {useTransformer});

    {
      const {line, column} = getLineAndColumn(compiledJS, 'a string');
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(3, 'first string definition');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'another string');
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(4, 'second string definition');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
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
    const {compiledJS, sourceMap} = compile(sources, {useTransformer, outFile: 'output.js'});

    {
      const {line, column} = getLineAndColumn(compiledJS, 'a string');
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(3, 'first string definition');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input1.ts', 'first input file');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'fourth rate');
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(4, 'fourth string definition');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input2.ts', 'second input file');
    }
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
    const {compiledJS, sourceMap} = compile(sources, {outFile: 'a/d/output.js', useTransformer});

    {
      const {line, column} = getLineAndColumn(compiledJS, 'a string');
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(3, 'first string definition');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('../b/input1.ts', 'first input file');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'fourth rate');
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(4, 'fourth string definition');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('../c/input2.ts', 'second input file');
    }
  });

  it('works when not decorator downleveling some input', () => {
    const sources = new Map<string, string>();
    sources.set('input1.ts', `
        /** @Annotation */
        function class1Annotation(t: any) { return t; }

        @class1Annotation
        class DecoratorTest1 {
          public method1Name(s: string): string { return s; }
        }`);

    sources.set('input2.ts', `
        /** @Annotation */
        function class2Annotation(t: any) { return t; }

        @class2Annotation
        class DecoratorTest2 {
          public method2Name(s: string): string { return s; }
        }`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {compiledJS, sourceMap} = compile(
        sources,
        {filesNotToProcess: new Set<string>(['input2.ts']), useTransformer, outFile: 'output.js'});

    // Check that we decorator downleveled input1, but not input2
    expect(compiledJS).to.contain('DecoratorTest1.decorators');
    expect(compiledJS).not.to.contain('DecoratorTest2.decorators');

    // Check that the source maps work
    {
      const {line, column} = getLineAndColumn(compiledJS, 'method1Name');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(7, 'method 1 definition');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input1.ts', 'method 1 input file');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'method2Name');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(7, 'method 1 definition');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input2.ts', 'method 2 input file');
    }
  });

  it('handles decorators correctly', () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', `/** @Annotation */
        function classAnnotation(t: any) { return t; }

        @classAnnotation
        class DecoratorTest {
          public methodName(s: string): string { return s; }
        }`);

    const {compiledJS, sourceMap} = compile(sources, {useTransformer});

    const {line, column} = getLineAndColumn(compiledJS, 'methodName');

    expect(sourceMap.originalPositionFor({line, column}).line).to.equal(6, 'method position');
  });

  it('composes inline sources', () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', `
      class X { field: number; }
      let x : string = 'a string';
      let y : string = 'another string';
      let z : string = x + y;`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {compiledJS, sourceMap} = compile(sources, {inlineSourceMap: true, useTransformer});

    {
      const {line, column} = getLineAndColumn(compiledJS, 'a string');
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(3, 'first string definition');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'another string');
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(4, 'second string definition');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
  });

  it(`doesn't blow up trying to handle a source map in a .d.ts file`, () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', `
      class X { field: number; }
      let x : string = 'a string';
      let y : string = 'another string';
      let z : string = x + y;`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {compiledJS, dts, sourceMap} =
        compile(sources, {inlineSourceMap: true, generateDTS: true, useTransformer});

    const {line, column} = getLineAndColumn(compiledJS, 'a string');
    expect(sourceMap.originalPositionFor({line, column}).line)
        .to.equal(3, 'first string definition');
    expect(sourceMap.originalPositionFor({line, column}).source)
        .to.equal('input.ts', 'input file name');

    expect(dts).to.contain('declare let x: string;');
  });

  it('handles input source maps', () => {
    const decoratorDownlevelSources = new Map<string, string>();
    decoratorDownlevelSources.set('input.ts', `/** @Annotation */
        function classAnnotation(t: any) { return t; }

        @classAnnotation
        class DecoratorTest {
          public methodName(s: string): string { return s; }
        }`);

    const closurizeSources = decoratorDownlevelAndAddInlineSourceMaps(decoratorDownlevelSources);

    const {compiledJS, sourceMap} =
        compile(closurizeSources, {inlineSourceMap: true, useTransformer});

    expect(getInlineSourceMapCount(compiledJS)).to.equal(1);
    const {line, column} = getLineAndColumn(compiledJS, 'methodName');
    expect(sourceMap.originalPositionFor({line, column}).line).to.equal(6, 'method position');
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

  it('handles input source maps with different file names than supplied to tsc', () => {
    const sources = createInputWithSourceMap({file: 'foo/bar/intermediate.ts'});
    const {compiledJS, sourceMap} = compile(sources, {useTransformer});
    expect(getInlineSourceMapCount(compiledJS)).to.equal(0);

    const {line, column} = getLineAndColumn(compiledJS, 'x = 3');
    expect(sourceMap.originalPositionFor({line, column}).line).to.equal(1, 'x = 3 definition');
    expect(sourceMap.originalPositionFor({line, column}).source)
        .to.equal('original.ts', 'input file name');
  });

  it('handles input source maps with an outDir different than the rootDir', () => {
    const sources = createInputWithSourceMap({file: 'foo/bar/intermediate.ts'});

    const {compiledJS, sourceMap} =
        compile(sources, {inlineSourceMap: true, useTransformer, outFile: '/out/output.js'});

    const {line, column} = getLineAndColumn(compiledJS, 'x = 3');
    expect(sourceMap.originalPositionFor({line, column}).source)
        .to.equal('original.ts', 'input file name');
  });

  it('removes incoming inline sourcemaps from the sourcemap content', () => {
    // make sure that not the whole file is mapped so that
    // sources of the intermediate file are present in the sourcemap.
    const sources = createInputWithSourceMap({'mappings': ';', 'sources': ['intermediate.ts']});

    const {sourceMapText} = compile(sources, {inlineSourceMap: true, useTransformer});
    const parsedSourceMap = parseSourceMap(sourceMapText);
    expect(parsedSourceMap.sources[0]).to.eq('intermediate.ts');
    expect(containsInlineSourceMap(parsedSourceMap.sourcesContent![0]))
        .to.eq(false, 'contains inline sourcemap');
  });

  it(`doesn't blow up putting an inline source map in an empty file`, () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', ``);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {compiledJS, sourceMap} = compile(sources, {inlineSourceMap: true, useTransformer});

    expect(sourceMap).to.exist;
    expect(compiledJS).to.contain(`var module = {id: 'input.js'};`);
  });

  it(`handles mixed source mapped and non source mapped input`, () => {
    const decoratorDownlevelSources = new Map<string, string>();
    decoratorDownlevelSources.set('input1.ts', `/** @Annotation */
        function classAnnotation(t: any) { return t; }

        @classAnnotation
        class DecoratorTest {
          public methodName(s: string): string { return s; }
        }`);

    const closurizeSources = decoratorDownlevelAndAddInlineSourceMaps(decoratorDownlevelSources);
    closurizeSources.set('input2.ts', `
      class X { field: number; }
      let x : string = 'a string';
      let y : string = 'another string';
      let z : string = x + y;`);

    const {compiledJS, sourceMap} =
        compile(closurizeSources, {useTransformer, outFile: 'output.js'});

    {
      const {line, column} = getLineAndColumn(compiledJS, 'methodName');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(6, 'method position');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'another string');
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(4, 'second string definition');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input2.ts', 'input file name');
    }
  });

  it('maps at the start of lines correctly', () => {
    const sources = new Map([[
      'input.ts', `let x : number = 2;
      x + 1;
      let y = {z: 2};
      y.z;`
    ]]);

    const {compiledJS, sourceMap} = compile(sources, {useTransformer: true});

    {
      const {line, column} = getLineAndColumn(compiledJS, 'var /** @type {number} */ x');
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(1, 'variable declaration line');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'x + 1');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(2, 'addition line');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'y.z');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(4, 'object access line');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
  });
}

function decoratorDownlevelAndAddInlineSourceMaps(sources: Map<string, string>):
    Map<string, string> {
  const transformedSources = new Map<string, string>();
  const program = createProgram(sources);
  for (const fileName of toArray(sources.keys())) {
    const sourceMapper = new DefaultSourceMapper(fileName);
    const {output} = convertDecorators(program.getTypeChecker(), program.getSourceFile(fileName));
    transformedSources.set(fileName, setInlineSourceMap(output, sourceMapper.sourceMap.toString()));
  }
  return transformedSources;
}