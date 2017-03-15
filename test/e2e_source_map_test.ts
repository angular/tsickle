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

import * as cliSupport from '../src/cli_support';
import {ANNOTATION_SUPPORT_CODE, convertDecorators} from '../src/decorator-annotator';
import {toClosureJS} from '../src/main';
import {getInlineSourceMapCount, setInlineSourceMap,} from '../src/source_map_utils';
import * as tsickle from '../src/tsickle';
import {toArray} from '../src/util';

import * as testSupport from './test_support';

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

  it('handles files in different directories', function() {
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
    const {compiledJS, sourceMap} = compile(sources, {outFile: 'a/d/output.js'});

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

  it('works when not decorator downleveling some input', function() {
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
    const {compiledJS, sourceMap} =
        compile(sources, {filesNotToProcess: new Set<string>(['input2.ts'])});

    // Check that we decorator downleveled input1, but not input2
    expect(compiledJS).to.contain('DecoratorTest1_tsickle_Closure_declarations');
    expect(compiledJS).not.to.contain('DecoratorTest2_tsickle_Closure_declarations');

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

  it('handles decorators correctly', function() {
    const sources = new Map<string, string>();
    sources.set('input.ts', `/** @Annotation */
        function classAnnotation(t: any) { return t; }

        @classAnnotation
        class DecoratorTest {
          public methodName(s: string): string { return s; }
        }`);

    const {compiledJS, sourceMap} = compile(sources);

    const {line, column} = getLineAndColumn(compiledJS, 'methodName');

    expect(sourceMap.originalPositionFor({line, column}).line).to.equal(6, 'method position');
  });

  it('composes inline sources', function() {
    const sources = new Map<string, string>();
    sources.set('input.ts', `
      class X { field: number; }
      let x : string = 'a string';
      let y : string = 'another string';
      let z : string = x + y;`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {compiledJS, sourceMap} = compile(sources, {inlineSourceMap: true});

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

  it(`doesn't blow up trying to handle a source map in a .d.ts file`, function() {
    const sources = new Map<string, string>();
    sources.set('input.ts', `
      class X { field: number; }
      let x : string = 'a string';
      let y : string = 'another string';
      let z : string = x + y;`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {compiledJS, dts, sourceMap} =
        compile(sources, {inlineSourceMap: true, generateDTS: true});

    const {line, column} = getLineAndColumn(compiledJS, 'a string');
    expect(sourceMap.originalPositionFor({line, column}).line)
        .to.equal(3, 'first string definition');
    expect(sourceMap.originalPositionFor({line, column}).source)
        .to.equal('input.ts', 'input file name');

    expect(dts).to.contain('declare let x: string;');
  });

  it('handles input source maps', function() {
    const decoratorDownlevelSources = new Map<string, string>();
    decoratorDownlevelSources.set('input.ts', `/** @Annotation */
        function classAnnotation(t: any) { return t; }

        @classAnnotation
        class DecoratorTest {
          public methodName(s: string): string { return s; }
        }`);

    const closurizeSources = decoratorDownlevelAndAddInlineSourceMaps(decoratorDownlevelSources);

    const {compiledJS, sourceMap} =
        compile(closurizeSources, {inlineSourceMap: true, tsicklePasses: [tsickle.Pass.CLOSURIZE]});

    expect(getInlineSourceMapCount(compiledJS)).to.equal(1);
    const {line, column} = getLineAndColumn(compiledJS, 'methodName');
    expect(sourceMap.originalPositionFor({line, column}).line).to.equal(6, 'method position');
  });

  it('handles input source maps with different file names than supplied to tsc', function() {
    const sources = new Map<string, string>();
    const inputSourceMap =
        `{"version":3,"sources":["original.ts"],"names":[],"mappings":"AAAA,MAAM,EAAE,EAAE,CAAC","file":"foo/bar/intermediate.ts","sourceRoot":""}`;
    const encodedSourceMap = Buffer.from(inputSourceMap, 'utf8').toString('base64');
    sources.set('intermediate.ts', `const x = 3;
//# sourceMappingURL=data:application/json;base64,${encodedSourceMap}`);

    const {compiledJS, sourceMap} = compile(sources);

    const {line, column} = getLineAndColumn(compiledJS, 'x');
    expect(sourceMap.originalPositionFor({line, column}).line).to.equal(1, 'x definition');
    expect(sourceMap.originalPositionFor({line, column}).source)
        .to.equal('original.ts', 'input file name');
  });

  it(`doesn't blow up putting an inline source map in an empty file`, function() {
    const sources = new Map<string, string>();
    sources.set('input.ts', ``);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {compiledJS, sourceMap} = compile(sources, {inlineSourceMap: true});

    expect(sourceMap).to.exist;
    expect(compiledJS).to.contain(`var module = {id: 'output.js'};`);
  });

  it(`handles mixed source mapped and non source mapped input`, function() {
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
        compile(closurizeSources, {tsicklePasses: [tsickle.Pass.CLOSURIZE]});

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
});

function decoratorDownlevelAndAddInlineSourceMaps(sources: Map<string, string>):
    Map<string, string> {
  const transformedSources = new Map<string, string>();
  let program = testSupport.createProgram(sources);
  for (const fileName of toArray(sources.keys())) {
    let {output, sourceMap: preexistingSourceMap} =
        convertDecorators(program.getTypeChecker(), program.getSourceFile(fileName));
    output = output + ANNOTATION_SUPPORT_CODE;
    transformedSources.set(fileName, setInlineSourceMap(output, preexistingSourceMap.toString()));
  }
  return transformedSources;
}

function getLineAndColumn(source: string, token: string): {line: number, column: number} {
  const lines = source.split('\n');
  const line = lines.findIndex(l => l.indexOf(token) !== -1) + 1;
  if (line === 0) {
    throw new Error(`Couldn't find token '${token}' in source`);
  }
  const column = lines[line - 1].indexOf(token) + 1;
  return {line, column};
}

interface CompilerOptions {
  outFile: string;
  filesNotToProcess: Set<string>;
  inlineSourceMap: boolean;
  tsicklePasses: tsickle.Pass[];
  generateDTS: boolean;
}

const DEFAULT_COMPILER_OPTIONS = {
  outFile: 'output.js',
  filesNotToProcess: new Set<string>(),
  inlineSourceMap: false,
  tsicklePasses: [tsickle.Pass.DECORATOR_DOWNLEVEL, tsickle.Pass.CLOSURIZE],
  generateDTS: false,
};

function compile(sources: Map<string, string>, partialOptions = {} as Partial<CompilerOptions>):
    {compiledJS: string, dts: string | undefined, sourceMap: SourceMapConsumer} {
  const options: CompilerOptions = {...DEFAULT_COMPILER_OPTIONS, ...partialOptions};
  const resolvedSources = new Map<string, string>();
  for (const fileName of toArray(sources.keys())) {
    resolvedSources.set(ts.sys.resolvePath(fileName), sources.get(fileName));
  }

  const diagnostics: ts.Diagnostic[] = [];

  let compilerOptions: ts.CompilerOptions;
  if (options.inlineSourceMap) {
    compilerOptions = {
      inlineSourceMap: options.inlineSourceMap,
      outFile: options.outFile,
      experimentalDecorators: true,
      declaration: options.generateDTS,
    };
  } else {
    compilerOptions = {
      sourceMap: true,
      outFile: options.outFile,
      experimentalDecorators: true,
      declaration: options.generateDTS,
    };
  }

  const fileNames = toArray(sources.keys());

  const tsickleHost: tsickle.TsickleHost = {
    shouldSkipTsickleProcessing:
        (fileName) => fileNames.indexOf(fileName) === -1 || options.filesNotToProcess.has(fileName),
    pathToModuleName: cliSupport.pathToModuleName,
    shouldIgnoreWarningsForPath: (filePath) => false,
    fileNameToModuleId: (fileName) => fileName,
  };

  const closureJSOPtions = {
    files: resolvedSources,
    tsickleHost: tsickleHost,
    tsicklePasses: options.tsicklePasses,
  };

  const closure = toClosureJS(compilerOptions, fileNames, {}, diagnostics, closureJSOPtions);

  if (!closure) {
    console.error(tsickle.formatDiagnostics(diagnostics));
    assert.fail();
    // TODO(lucassloan): remove when the .d.ts has the correct types
    return {compiledJS: '', dts: '', sourceMap: new SourceMapConsumer('' as any)};
  }

  const compiledJS = getFileWithName(options.outFile, closure.jsFiles);

  if (!compiledJS) {
    assert.fail();
    // TODO(lucassloan): remove when the .d.ts has the correct types
    return {compiledJS: '', dts: '', sourceMap: new SourceMapConsumer('' as any)};
  }

  // TODO(lucassloan): remove when the .d.ts has the correct types
  let sourceMapJson: any;
  if (options.inlineSourceMap) {
    sourceMapJson = extractInlineSourceMap(compiledJS);
  } else {
    sourceMapJson = getFileWithName(options.outFile + '.map', closure.jsFiles);
  }
  const sourceMap = new SourceMapConsumer(sourceMapJson);

  const dts = getFileWithName(
      options.outFile.substring(0, options.outFile.length - 3) + '.d.ts', closure.jsFiles);

  return {compiledJS, dts, sourceMap};
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
  for (let filepath of toArray(files.keys())) {
    if (path.parse(filepath).base === path.parse(filename).base) {
      return files.get(filepath);
    }
  }
  return undefined;
}
