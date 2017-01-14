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
import {Settings, toClosureJS} from '../src/main';
import * as tsickle from '../src/tsickle';
import {toArray} from '../src/util';
import {createOutputRetainingCompilerHost, createSourceReplacingCompilerHost} from '../src/util';

describe('source maps', () => {
  it('composes source maps with tsc', function() {
    const sources = new Map<string, string>();
    sources.set('input.ts', `
      class X { field: number; }
      let x : string = 'a string';
      let y : string = 'another string';
      let z : string = x + y;`);

    // Run tsickle+TSC to convert inputs to Closure JS files.
    const {compiledJS, sourceMap} = compileWithAnnotation(sources);

    const {line: stringXLine, column: stringXColumn} = getLineAndColumn(compiledJS, 'a string');
    const {line: stringYLine, column: stringYColumn} =
        getLineAndColumn(compiledJS, 'another string');

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
    const {compiledJS, sourceMap} = compileWithAnnotation(sources);

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

  it('handles decorators correctly', function() {
    const sources = new Map<string, string>();
    sources.set('input.ts', `/** @Annotation */
        function classAnnotation(t: any) { return t; }

        @classAnnotation
        class DecoratorTest {
          public methodName(s: string): string { return s; }
        }`);

    const {compiledJS, sourceMap} = compileWithDecoratorDownleveling(sources);

    const methodPosition = getLineAndColumn(compiledJS, 'methodName');

    expect(sourceMap.originalPositionFor(methodPosition).line).to.equal(6, 'method position');
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

function compileWithAnnotation(sources: Map<string, string>):
    {compiledJS: string, sourceMap: SourceMapConsumer} {
  return compile(sources, toClosureJS);
}

function compileWithDecoratorDownleveling(sources: Map<string, string>):
    {compiledJS: string, sourceMap: SourceMapConsumer} {
  return compile(sources, decoratorDownlevelCompiler);
}

interface Compiler {
  (options: ts.CompilerOptions, fileNames: string[], settings: Settings,
   allDiagnostics: ts.Diagnostic[],
   files?: Map<string, string>): {jsFiles: Map<string, string>, externs: string}|null;
}

function decoratorDownlevelCompiler(
    options: ts.CompilerOptions, fileNames: string[], settings: Settings,
    allDiagnostics: ts.Diagnostic[],
    files?: Map<string, string>): {jsFiles: Map<string, string>, externs: string}|null {
  let program = files === undefined ?
      ts.createProgram(fileNames, options) :
      ts.createProgram(
          fileNames, options,
          createSourceReplacingCompilerHost(files, ts.createCompilerHost(options)));
  {  // Scope for the "diagnostics" variable so we can use the name again later.
    let diagnostics = ts.getPreEmitDiagnostics(program);
    if (diagnostics.length > 0) {
      allDiagnostics.push(...diagnostics);
      return null;
    }
  }

  const tsickleCompilerHostOptions: tsickle.TsickleCompilerHostOptions = {
    googmodule: true,
    es5Mode: false,
    tsickleTyped: !settings.isUntyped,
    prelude: '',
  };

  const tsickleHost: tsickle.TsickleHost = {
    shouldSkipTsickleProcessing: (fileName) => fileNames.indexOf(fileName) === -1,
    pathToModuleName: cliSupport.pathToModuleName,
    shouldIgnoreWarningsForPath: (filePath) => false,
    fileNameToModuleId: (fileName) => fileName,
  };

  const jsFiles = new Map<string, string>();
  const hostDelegate = createOutputRetainingCompilerHost(jsFiles, ts.createCompilerHost(options));

  // Reparse and reload the program, inserting the tsickle output in
  // place of the original source.
  let host = new tsickle.TsickleCompilerHost(
      hostDelegate, tsickleCompilerHostOptions, tsickleHost,
      {oldProgram: program, pass: tsickle.Pass.DECORATOR_DOWNLEVEL});
  program = ts.createProgram(fileNames, options, host);

  let {diagnostics} = program.emit(undefined);
  if (diagnostics.length > 0) {
    allDiagnostics.push(...diagnostics);
    return null;
  }

  return {jsFiles, externs: host.getGeneratedExterns()};
}

function compile(sources: Map<string, string>, compiler: Compiler):
    {compiledJS: string, sourceMap: SourceMapConsumer} {
  const resolvedSources = new Map<string, string>();
  for (const fileName of toArray(sources.keys())) {
    resolvedSources.set(ts.sys.resolvePath(fileName), sources.get(fileName));
  }

  const diagnostics: ts.Diagnostic[] = [];

  const closure = compiler(
      {sourceMap: true, outFile: 'output.js', experimentalDecorators: true} as ts.CompilerOptions,
      toArray(sources.keys()), {isUntyped: false} as Settings, diagnostics, resolvedSources);

  if (!closure) {
    diagnostics.forEach(v => console.log(JSON.stringify(v)));
    assert.fail();
    // TODO(lucassloan): remove when the .d.ts has the correct types
    return {compiledJS: '', sourceMap: new SourceMapConsumer('' as any)};
  }

  const compiledJS = getFileWithName('output.js', closure.jsFiles);

  if (!compiledJS) {
    assert.fail();
    // TODO(lucassloan): remove when the .d.ts has the correct types
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
