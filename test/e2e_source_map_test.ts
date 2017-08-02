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
    const {compiledJS, sourceMap} = compile(sources, {useTransformer});

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
    const {compiledJS, sourceMap} =
        compile(sources, {filesNotToProcess: new Set<string>(['input2.ts']), useTransformer});

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

    const {compiledJS, sourceMap} = compile(closurizeSources, {useTransformer});

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
      x + 1;`
    ]]);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {compiledJS, sourceMap} = compile(sources, {useTransformer});

    {
      const {line, column} = getLineAndColumn(compiledJS, 'var /** @type {?} */ x');
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
  const column = lines[line - 1].indexOf(token) + 1;
  return {line, column};
}

interface CompilerOptions {
  useTransformer: boolean;
  outFile: string;
  filesNotToProcess: Set<string>;
  inlineSourceMap: boolean;
  generateDTS: boolean;
}

const DEFAULT_COMPILER_OPTIONS = {
  outFile: 'output.js',
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

  const compiledJS = getFileWithName(options.outFile, jsFiles);

  if (!compiledJS) {
    assert.fail();
    return {compiledJS: '', dts: '', sourceMap: sourceMapTextToConsumer(''), sourceMapText: ''};
  }

  let sourceMapJson: string;
  if (options.inlineSourceMap) {
    sourceMapJson = extractInlineSourceMap(compiledJS);
  } else {
    sourceMapJson = getFileWithName(options.outFile + '.map', jsFiles) || '';
  }
  const sourceMap = sourceMapTextToConsumer(sourceMapJson);

  const dts =
      getFileWithName(options.outFile.substring(0, options.outFile.length - 3) + '.d.ts', jsFiles);

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
  const closure = toClosureJS(compilerOptions, fileNames, {}, diagnostics, closureJSOPtions);
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
          untyped: true,
        },
        tsHost, compilerOptions);
    allDiagnostics.push(...diagnostics);
  }
  return {jsFiles, diagnostics: allDiagnostics};
}