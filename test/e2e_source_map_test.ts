/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// tslint:disable:no-unused-expression mocha .to.be.empty getters.

import {assert, expect} from 'chai';
import * as path from 'path';
import {RawSourceMap, SourceMapConsumer} from 'source-map';
import * as ts from 'typescript';

import * as cliSupport from '../src/cli_support';
import {convertDecorators} from '../src/decorator-annotator';
import {toClosureJS} from '../src/main';
import {containsInlineSourceMap, DefaultSourceMapper, getInlineSourceMapCount, parseSourceMap, setInlineSourceMap, sourceMapTextToConsumer} from '../src/source_map_utils';
import * as tsickle from '../src/tsickle';
import {createOutputRetainingCompilerHost, createSourceReplacingCompilerHost, toArray} from '../src/util';

import * as testSupport from './test_support';

describe('source maps with TsickleCompilerHost', () => {
  createTests(false);
});
// describe('source maps with transformer', () => {
//   createTests(true);
// });

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
    const {compiledJS, sourceMap} =
        compile(sources, {inlineSourceMap: true, useTransformer, outFile: 'output.js'});

    expect(sourceMap).to.exist;
    expect(compiledJS).to.contain(`var module = {id: 'output.js'};`);
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

    const {compiledJS, sourceMap} = compile(sources, {useTransformer});

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


  it('maps both parts of the class declaration to the original code', () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', `class X { field: number; }`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {compiledJS, sourceMap} = compile(sources, {useTransformer});

    {
      const {line, column} = getLineAndColumn(compiledJS, 'var X');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(1, 'class definition');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} =
          getLineAndColumn(compiledJS, 'function X_tsickle_Closure_declarations');
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(1, 'closure type annotation');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'X_tsickle_Closure_declarations');
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(1, 'closure type annotation');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'X.prototype.field;');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(1, 'field definition');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
  });

  it('maps correctly to a multiline class definition', () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', `class X {
      field: number = 3;
      foo(x: number) {
        return x + 1;
      }
    }`);


    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {compiledJS, sourceMap} = compile(sources, {useTransformer});

    {
      const {line, column} = getLineAndColumn(compiledJS, 'X.prototype.field;');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(2, 'field definition');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, '/** @type {number} */');
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(2, 'field type annotation');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'this.field = 3;');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(2, 'field value set');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'X_tsickle_Closure_declarations');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(1, 'closure declaration');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'X.prototype.foo');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(3, 'method declaration');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'return x + 1;');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(4, 'method body');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    // TODO(lucassloan): waiting on https://github.com/Microsoft/TypeScript/issues/17576
    // so we can source map jsdoc comments
    // {
    //   const {line, column} = getLineAndColumn(compiledJS, '@param {number} x');
    //   expect(sourceMap.originalPositionFor({line, column}).line)
    //       .to.equal(3, 'method parameter type annotation');
    //   expect(sourceMap.originalPositionFor({line, column}).source)
    //       .to.equal('input.ts', 'input file name');
    // }
    // {
    //   const {line, column} = getLineAndColumn(compiledJS, '@return {number}');
    //   expect(sourceMap.originalPositionFor({line, column}).line)
    //       .to.equal(3, 'method return type annotation');
    //   expect(sourceMap.originalPositionFor({line, column}).source)
    //       .to.equal('input.ts', 'input file name');
    // }
  });

  it('maps import declarations correctly', () => {
    const sources = new Map<string, string>();
    // sources.set('fanargl.ts', `export const x = 4;`);
    sources.set('input.ts', `import * as ts from 'typescript';
      import {join, format as fmt} from 'path';
      ts.ModuleKind.CommonJS;
      join;
      fmt;`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {compiledJS, sourceMap} = compile(sources, {useTransformer});

    {
      const {line, column} = getLineAndColumn(compiledJS, `var ts`);
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(1, 'typescript require');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, `goog.require('typescript')`);
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(1, 'typescript require');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, `var path_1`);
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(2, 'path require');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, `goog.require('path')`);
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(2, 'path require');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
  });

  it('maps export declarations correctly', () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', `export const x = 4;
      const y = 'stringy';
      export {y};
      export {format as fmt} from "path";`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {compiledJS, sourceMap} = compile(sources, {useTransformer});

    {
      const {line, column} = getLineAndColumn(compiledJS, 'exports.x = 4;');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(1, 'x export');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'exports.y = y;');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(3, 'y export');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'exports.fmt');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(4, 'fmt export');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'path_1.format');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(4, 'fmt export');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
  });

  it('maps interface declarations correctly', () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', `interface Foo {
        color: string;
        width?: number;
        [propName: string]: any;
      }`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {compiledJS, sourceMap} = compile(sources, {useTransformer});

    {
      const {line, column} = getLineAndColumn(compiledJS, 'Foo()');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(1, 'class definition');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'Foo_tsickle_Closure_declarations()');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(1, 'closure declaration');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, '/** @type {string} */');
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(2, 'color type annotation');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'Foo.prototype.color;');
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(2, 'color field declaration');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, '/** @type {number} */');
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(3, 'width type annotation');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
  });

  it('maps variable declarations', () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', `let x : string = 'a string';`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {compiledJS, sourceMap} = compile(sources, {useTransformer});

    {
      const {line, column} = getLineAndColumn(compiledJS, '/** @type {string} */');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(1, 'type annotation');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'var');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(1, 'var keyword');
      expect(sourceMap.originalPositionFor({line, column}).column).to.equal(0, 'var keyword');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'x');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(1, 'variable name');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
  });

  it('maps constructors', () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', `class X {
      constructor(private x: number, public y: string) {}
    }`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {compiledJS, sourceMap} = compile(sources, {useTransformer});

    {
      const {line, column} = getLineAndColumn(compiledJS, 'function X(x, y)');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(2, 'constructor');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'this.x = x;');
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(2, 'constructor field assignment');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, '/** @type {number} */');
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(2, 'field type annotation');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'X.prototype.x;');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(2, 'field declaration');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    // TODO(lucassloan): waiting on https://github.com/Microsoft/TypeScript/issues/17576
    // so we can source map jsdoc comments
    // {
    //   const {line, column} = getLineAndColumn(compiledJS, '@param {number} x');
    //   expect(sourceMap.originalPositionFor({line, column}).line)
    //       .to.equal(2, 'field declaration');
    //   expect(sourceMap.originalPositionFor({line, column}).source)
    //       .to.equal('input.ts', 'input file name');
    // }
  });

  it('maps function definitions', () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', `function incr(n: number): number {
        return n + 1;
      }`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {compiledJS, sourceMap} = compile(sources, {useTransformer});

    // TODO(lucassloan): waiting on https://github.com/Microsoft/TypeScript/issues/17576
    // so we can source map jsdoc comments
    // {
    //   const {line, column} = getLineAndColumn(compiledJS, '@param {number} n');
    //   expect(sourceMap.originalPositionFor({line, column}).line)
    //       .to.equal(1, 'constructor');
    //   expect(sourceMap.originalPositionFor({line, column}).source)
    //       .to.equal('input.ts', 'input file name');
    // }
    // {
    //   const {line, column} = getLineAndColumn(compiledJS, '@return {number}');
    //   expect(sourceMap.originalPositionFor({line, column}).line)
    //       .to.equal(1, 'constructor');
    //   expect(sourceMap.originalPositionFor({line, column}).source)
    //       .to.equal('input.ts', 'input file name');
    // }
  });

  it('maps type alias declarations', () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', `type foo = string;`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {compiledJS, sourceMap} = compile(sources, {useTransformer});

    {
      const {line, column} = getLineAndColumn(compiledJS, '/** @typedef {string} */');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(1, 'typedef');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'var foo;');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(1, 'type var');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
  });

  it('maps enum declarations', () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', `enum Direction {
        Up = 1,
        Down,
        Left,
        Right
      }`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {compiledJS, sourceMap} = compile(sources, {useTransformer});

    {
      const {line, column} = getLineAndColumn(compiledJS, '/** @enum {number} */');
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(1, 'enum type annotation');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'var Direction');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(1, 'enum declaration');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'Up: 1,');
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(2, 'enum option definition');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'Direction[Direction.Up] = "Up";');
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(2, 'enum option name declaration');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
  });

  it('maps template spans', () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', '`text text text\n${1 + 1}\n${null as string}`');

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {compiledJS, sourceMap} = compile(sources, {useTransformer});

    {
      const {line, column} = getLineAndColumn(compiledJS, 'text text text');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(1, 'basic text');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, '1 + 1');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(2, 'addition');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, '(null)');
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(3, 'type cast with parentheses');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
  });

  it('maps type assertions', () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', `const x = undefined as string;
      const y = <number>undefined;`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {compiledJS, sourceMap} = compile(sources, {useTransformer});

    {
      const {line, column} = getLineAndColumn(compiledJS, '/** @type {string} */');
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(1, 'string type annotation');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, '(undefined)');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(1, 'bracketed undefined');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, '/** @type {number} */');
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(2, 'number type annotation');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'y = (undefined)');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(2, 'variable definition');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
  });

  it('maps non null expression', () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', `let x: string = undefined!;`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {compiledJS, sourceMap} = compile(sources, {useTransformer});

    {
      const {line, column} = getLineAndColumn(compiledJS, '/** @type {string} */');
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(1, 'string type annotation');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, '((undefined))');
      expect(sourceMap.originalPositionFor({line, column}).line).to.equal(1, 'bracketed undefined');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
  });

  it('maps element access', () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', `class X {
        [propName: string]: any;
      }
      
      const x = new X();
      x.foo;`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {compiledJS, sourceMap} = compile(sources, {useTransformer});

    {
      const {line, column} = getLineAndColumn(compiledJS, 'x["foo"];');
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(6, 'rewritten element access');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
  });

  it('maps decorators', () => {
    const sources = new Map<string, string>();
    sources.set('input.ts', `
        /** @Annotation */
        function classAnnotation(t: any) {
            return t;
        }

        @classAnnotation({
            x: 'thingy',
        })
        class DecoratorTest1 {
            y: string;
        }`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {compiledJS, sourceMap} = compile(sources, {useTransformer});

    {
      const {line, column} = getLineAndColumn(compiledJS, 'DecoratorTest1.decorators');
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(7, 'decorator declaration');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'type: classAnnotation');
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(7, 'individual decorator type');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, `x: 'thingy'`);
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(8, 'individual decorator args');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(
          compiledJS, 'DecoratorTest1.ctorParameters = function () { return []; };');
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(7, 'constructor decorator declaration');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'DecoratorTest1.decorators;');
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(7, 'decorator type annotation');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    {
      const {line, column} = getLineAndColumn(compiledJS, 'DecoratorTest1.prototype.y;');
      expect(sourceMap.originalPositionFor({line, column}).line)
          .to.equal(11, 'normal field type annotation');
      expect(sourceMap.originalPositionFor({line, column}).source)
          .to.equal('input.ts', 'input file name');
    }
    // TODO(lucassloan): waiting on https://github.com/Microsoft/TypeScript/issues/17576
    // so we can source map jsdoc comments
    // {
    //   const {line, column} = getLineAndColumn(compiledJS, '@param {?} t');
    //   expect(sourceMap.originalPositionFor({line, column}).line)
    //       .to.equal(3, 'annotation parameter type annotation');
    //   expect(sourceMap.originalPositionFor({line, column}).source)
    //       .to.equal('input.ts', 'input file name');
    // }
  });
}

function decoratorDownlevelAndAddInlineSourceMaps(sources: Map<string, string>):
    Map<string, string> {
  const transformedSources = new Map<string, string>();
  const program = testSupport.createProgram(sources);
  for (const fileName of toArray(sources.keys())) {
    const sourceMapper = new DefaultSourceMapper(fileName);
    const {output} = convertDecorators(program.getTypeChecker(), program.getSourceFile(fileName));
    transformedSources.set(fileName, setInlineSourceMap(output, sourceMapper.sourceMap.toString()));
  }
  return transformedSources;
}

function getLineAndColumn(source: string, token: string): {line: number, column: number} {
  const lines = source.split('\n');
  const line = lines.findIndex(l => l.indexOf(token) !== -1) + 1;
  if (line === 0) {
    throw new Error(`Couldn't find token '${token}' in source`);
  }
  const column = lines[line - 1].indexOf(token);
  return {line, column};
}

interface CompilerOptions {
  useTransformer: boolean;
  outFile?: string;
  filesNotToProcess: Set<string>;
  inlineSourceMap: boolean;
  generateDTS: boolean;
}

const DEFAULT_COMPILER_OPTIONS = {
  filesNotToProcess: new Set<string>(),
  inlineSourceMap: false,
  generateDTS: false,
};

function compile(
    sources: Map<string, string>,
    partialOptions: Partial<CompilerOptions>&{useTransformer: boolean}): {
  compiledJS: string,
  dts: string | undefined,
  sourceMap: SourceMapConsumer,
  sourceMapText: string
} {
  const options: CompilerOptions = {...DEFAULT_COMPILER_OPTIONS, ...partialOptions};
  const resolvedSources = new Map<string, string>();
  for (const fileName of toArray(sources.keys())) {
    resolvedSources.set(ts.sys.resolvePath(fileName), sources.get(fileName)!);
  }

  let compilerOptions: ts.CompilerOptions;
  if (options.inlineSourceMap) {
    compilerOptions = {
      inlineSourceMap: options.inlineSourceMap,
      inlineSources: true,
      outFile: options.outFile,
      experimentalDecorators: true,
      declaration: options.generateDTS,
    };
  } else {
    compilerOptions = {
      sourceMap: true,
      inlineSources: true,
      outFile: options.outFile,
      experimentalDecorators: true,
      declaration: options.generateDTS,
    };
  }

  const fileNames = toArray(sources.keys());

  const tsickleHost: tsickle.TsickleHost&tsickle.TransformerHost = {
    shouldSkipTsickleProcessing: (fileName) =>
        fileNames.indexOf(fileName) === -1 || options.filesNotToProcess.has(fileName),
    pathToModuleName: cliSupport.pathToModuleName,
    shouldIgnoreWarningsForPath: (filePath) => false,
    fileNameToModuleId: (fileName) => fileName,
  };

  const {jsFiles, diagnostics} = options.useTransformer ?
      compileWithTransfromer(resolvedSources, fileNames, tsickleHost, compilerOptions) :
      compileWithTsickleCompilerHost(resolvedSources, fileNames, tsickleHost, compilerOptions);

  if (diagnostics.length) {
    console.error(tsickle.formatDiagnostics(diagnostics));
    assert.fail();
    return {compiledJS: '', dts: '', sourceMap: sourceMapTextToConsumer(''), sourceMapText: ''};
  }

  let outFile = options.outFile;
  if (!outFile) {
    if (sources.size === 1) {
      const inputFileName = toArray(sources.keys())[0];
      outFile = inputFileName.substring(0, inputFileName.length - 3) + '.js';
    } else {
      outFile = 'input.js';
    }
  }
  const compiledJS = getFileWithName(outFile, jsFiles);

  if (!compiledJS) {
    assert.fail();
    return {compiledJS: '', dts: '', sourceMap: sourceMapTextToConsumer(''), sourceMapText: ''};
  }

  let sourceMapJson: string;
  if (options.inlineSourceMap) {
    sourceMapJson = extractInlineSourceMap(compiledJS);
  } else {
    sourceMapJson = getFileWithName(outFile + '.map', jsFiles) || '';
  }
  const sourceMap = sourceMapTextToConsumer(sourceMapJson);

  const dts = getFileWithName(outFile.substring(0, outFile.length - 3) + '.d.ts', jsFiles);

  return {compiledJS, dts, sourceMap, sourceMapText: sourceMapJson};
}

function extractInlineSourceMap(source: string): string {
  const inlineSourceMapRegex =
      new RegExp('//# sourceMappingURL=data:application/json;base64,(.*)$', 'mg');
  let previousResult: RegExpExecArray|null = null;
  let result: RegExpExecArray|null = null;
  // We want to extract the last source map in the source file
  // since that's probably the most recent one added.  We keep
  // matching against the source until we don't get a result,
  // then we use the previous result.
  do {
    previousResult = result;
    result = inlineSourceMapRegex.exec(source);
  } while (result !== null);
  const base64EncodedMap = previousResult![1];
  return Buffer.from(base64EncodedMap, 'base64').toString('utf8');
}

function getFileWithName(filename: string, files: Map<string, string>): string|undefined {
  for (const filepath of toArray(files.keys())) {
    if (path.parse(filepath).base === path.parse(filename).base) {
      return files.get(filepath);
    }
  }
  return undefined;
}

function compileWithTsickleCompilerHost(
    resolvedSources: Map<string, string>, fileNames: string[], tsickleHost: tsickle.TsickleHost,
    compilerOptions: ts.CompilerOptions):
    {jsFiles: Map<string, string>, diagnostics: ts.Diagnostic[]} {
  const closureJSOPtions = {
    files: resolvedSources,
    tsickleHost,
    tsicklePasses: [tsickle.Pass.DECORATOR_DOWNLEVEL, tsickle.Pass.CLOSURIZE],
  };

  const diagnostics: ts.Diagnostic[] = [];
  const closure =
      toClosureJS(compilerOptions, fileNames, {isTyped: true}, diagnostics, closureJSOPtions);
  return {jsFiles: closure ? closure.jsFiles : new Map<string, string>(), diagnostics};
}

function compileWithTransfromer(
    resolvedSources: Map<string, string>, fileNames: string[],
    transformerHost: tsickle.TransformerHost, compilerOptions: ts.CompilerOptions) {
  const jsFiles = new Map<string, string>();
  const tsHost = createSourceReplacingCompilerHost(
      resolvedSources,
      createOutputRetainingCompilerHost(jsFiles, ts.createCompilerHost(compilerOptions)));
  const program = ts.createProgram(fileNames, compilerOptions, tsHost);

  const allDiagnostics: ts.Diagnostic[] = [];
  allDiagnostics.push(...ts.getPreEmitDiagnostics(program));
  if (allDiagnostics.length === 0) {
    const {diagnostics} = tsickle.emitWithTsickle(
        program, transformerHost, {
          transformDecorators: true,
          transformTypesToClosure: true,
          googmodule: true,
          es5Mode: false,
          untyped: false,
        },
        tsHost, compilerOptions);
    allDiagnostics.push(...diagnostics);
  }
  return {jsFiles, diagnostics: allDiagnostics};
}