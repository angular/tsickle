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
import {Settings} from '../src/main';
import {extractInlineSourceMap, getInlineSourceMapCount, setInlineSourceMap,} from '../src/source_map_utils';
import * as tsickle from '../src/tsickle';
import {createOutputRetainingCompilerHost, createSourceReplacingCompilerHost, toArray} from '../src/util';

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

    const closurizeSources = new Map<string, string>();
    let program = testSupport.createProgram(decoratorDownlevelSources);
    let {output, sourceMap: preexistingSourceMap} =
        convertDecorators(program.getTypeChecker(), program.getSourceFile('input.ts'));
    output = output + ANNOTATION_SUPPORT_CODE;
    closurizeSources.set('input.ts', setInlineSourceMap(output, preexistingSourceMap.toString()));

    const {compiledJS, sourceMap} =
        compile(closurizeSources, {inlineSourceMap: true, tsicklePasses: [tsickle.Pass.CLOSURIZE]});

    expect(getInlineSourceMapCount(compiledJS)).to.equal(1);
    const {line, column} = getLineAndColumn(compiledJS, 'methodName');
    expect(sourceMap.originalPositionFor({line, column}).line).to.equal(6, 'method position');
  });
});

function getLineAndColumn(source: string, token: string): {line: number, column: number} {
  const lines = source.split('\n');
  const line = lines.findIndex(l => l.indexOf(token) !== -1) + 1;
  if (line === 0) {
    throw new Error(`Couldn't find token '${token}' in source`);
  }
  const column = lines[line - 1].indexOf(token) + 1;
  return {line, column};
}

interface Compiler {
  (options: ts.CompilerOptions, fileNames: string[], settings: Settings,
   allDiagnostics: ts.Diagnostic[],
   files?: Map<string, string>): {jsFiles: Map<string, string>, externs: string}|null;
}

function tsickleCompiler(
    options: ts.CompilerOptions, fileNames: string[], settings: Settings,
    allDiagnostics: ts.Diagnostic[], files: Map<string, string>, filesToIgnore: Set<string>,
    tsicklePasses: tsickle.Pass[]): {jsFiles: Map<string, string>, externs: string}|null {
  const tsickleCompilerHostOptions: tsickle.Options = {
    googmodule: true,
    es5Mode: false,
    untyped: settings.isUntyped,
  };

  const tsickleHost: tsickle.TsickleHost = {
    shouldSkipTsickleProcessing:
        (fileName) => fileNames.indexOf(fileName) === -1 || filesToIgnore.has(fileName),
    pathToModuleName: cliSupport.pathToModuleName,
    shouldIgnoreWarningsForPath: (filePath) => false,
    fileNameToModuleId: (fileName) => fileName,
  };

  const jsFiles = new Map<string, string>();
  const outputRetainingHost =
      createOutputRetainingCompilerHost(jsFiles, ts.createCompilerHost(options));

  const sourceReplacingHost = createSourceReplacingCompilerHost(files, outputRetainingHost);

  const tch = new tsickle.TsickleCompilerHost(
      sourceReplacingHost, options, tsickleCompilerHostOptions, tsickleHost);

  let program = ts.createProgram(fileNames, options, tch);
  {  // Scope for the "diagnostics" variable so we can use the name again later.
    let diagnostics = ts.getPreEmitDiagnostics(program);
    if (diagnostics.length > 0) {
      allDiagnostics.push(...diagnostics);
      return null;
    }
  }

  // Reparse and reload the program, inserting the tsickle output in
  // place of the original source.
  if (tsicklePasses.indexOf(tsickle.Pass.DECORATOR_DOWNLEVEL) !== -1) {
    tch.reconfigureForRun(program, tsickle.Pass.DECORATOR_DOWNLEVEL);
    program = ts.createProgram(fileNames, options, tch);
  }

  if (tsicklePasses.indexOf(tsickle.Pass.CLOSURIZE) !== -1) {
    tch.reconfigureForRun(program, tsickle.Pass.CLOSURIZE);
    program = ts.createProgram(fileNames, options, tch);
  }

  let {diagnostics} = program.emit(undefined);
  if (diagnostics.length > 0) {
    allDiagnostics.push(...diagnostics);
    return null;
  }

  return {jsFiles, externs: tch.getGeneratedExterns()};
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

function compile(sources: Map<string, string>, options = {} as Partial<CompilerOptions>):
    {compiledJS: string, dts: string | undefined, sourceMap: SourceMapConsumer} {
  const fullOptions: CompilerOptions = {...DEFAULT_COMPILER_OPTIONS, ...options};
  const resolvedSources = new Map<string, string>();
  for (const fileName of toArray(sources.keys())) {
    resolvedSources.set(ts.sys.resolvePath(fileName), sources.get(fileName));
  }

  const diagnostics: ts.Diagnostic[] = [];

  let compilerOptions: ts.CompilerOptions;
  if (fullOptions.inlineSourceMap) {
    compilerOptions = {
      inlineSourceMap: fullOptions.inlineSourceMap,
      outFile: fullOptions.outFile,
      experimentalDecorators: true,
      declaration: fullOptions.generateDTS,
    };
  } else {
    compilerOptions = {
      sourceMap: true,
      outFile: fullOptions.outFile,
      experimentalDecorators: true,
      declaration: fullOptions.generateDTS,
    };
  }

  const closure = tsickleCompiler(
      compilerOptions, toArray(sources.keys()), {isUntyped: false} as Settings, diagnostics,
      resolvedSources, fullOptions.filesNotToProcess, fullOptions.tsicklePasses);

  if (!closure) {
    console.error(tsickle.formatDiagnostics(diagnostics));
    assert.fail();
    // TODO(lucassloan): remove when the .d.ts has the correct types
    return {compiledJS: '', dts: '', sourceMap: new SourceMapConsumer('' as any)};
  }

  const compiledJS = getFileWithName(fullOptions.outFile, closure.jsFiles);

  if (!compiledJS) {
    assert.fail();
    // TODO(lucassloan): remove when the .d.ts has the correct types
    return {compiledJS: '', dts: '', sourceMap: new SourceMapConsumer('' as any)};
  }

  let sourceMapJson: any;
  if (fullOptions.inlineSourceMap) {
    sourceMapJson = extractInlineSourceMap(compiledJS);
  } else {
    sourceMapJson = getFileWithName(fullOptions.outFile + '.map', closure.jsFiles);
  }
  const sourceMap = new SourceMapConsumer(sourceMapJson);

  const dts = getFileWithName(
      fullOptions.outFile.substring(0, fullOptions.outFile.length - 3) + '.d.ts', closure.jsFiles);

  return {compiledJS, dts, sourceMap};
}

function getFileWithName(filename: string, files: Map<string, string>): string|undefined {
  for (let filepath of toArray(files.keys())) {
    if (path.parse(filepath).base === path.parse(filename).base) {
      return files.get(filepath);
    }
  }
}
