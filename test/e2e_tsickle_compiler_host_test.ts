import {expect} from 'chai';
import * as ts from 'typescript';

import {pathToModuleName} from '../src/cli_support';
import {formatDiagnostics} from '../src/tsickle';
import {Pass, TsickleCompilerHost} from '../src/tsickle_compiler_host';
import {createOutputRetainingCompilerHost, createSourceReplacingCompilerHost} from '../src/util';

const tsickleCompilerHostOptions = {
  googmodule: true,
  es5Mode: false,
  untyped: true,
};

const tsickleHost = {
  shouldSkipTsickleProcessing: (fileName: string) => false,
  pathToModuleName: pathToModuleName,
  shouldIgnoreWarningsForPath: (filePath: string) => false,
  fileNameToModuleId: (fileName: string) => fileName,
};

describe('tsickle compiler host', () => {
  function makeProgram(
      fileName: string, source: string): [ts.Program, ts.CompilerHost, ts.CompilerOptions] {
    // TsickleCompilerHost wants a ts.Program, which is the result of
    // parsing and typechecking the code before tsickle processing.
    // So we must create and run the entire stack of CompilerHost.
    let options: ts.CompilerOptions = {target: ts.ScriptTarget.ES5};
    let compilerHostDelegate = ts.createCompilerHost(options);
    const sources = new Map<string, string>();
    sources.set(ts.sys.resolvePath(fileName), source);
    let compilerHost = createSourceReplacingCompilerHost(sources, compilerHostDelegate);
    let program = ts.createProgram([fileName], {experimentalDecorators: true}, compilerHost);
    // To get types resolved, you must first call getPreEmitDiagnostics.
    let diags = formatDiagnostics(ts.getPreEmitDiagnostics(program));
    expect(diags).to.equal('');
    return [program, compilerHost, options];
  }

  it('applies tsickle transforms', () => {
    const [program, compilerHost, options] = makeProgram('foo.ts', 'let x: number = 123;');
    const host = new TsickleCompilerHost(
        compilerHost, options, tsickleCompilerHostOptions, tsickleHost,
        {oldProgram: program, pass: Pass.CLOSURIZE});
    const f = host.getSourceFile(program.getRootFileNames()[0], ts.ScriptTarget.ES5);
    // NOTE(evanm): currently tsickle just removes all types; we will
    // likely revisit this.
    expect(f.text).to.contain('/** @type {?} */');
  });

  it('lowers decorators to annotations', () => {
    const [program, compilerHost, options] =
        makeProgram('foo.ts', '/** @Annotation */ const A: Function = null; @A class B {}');
    const host = new TsickleCompilerHost(
        compilerHost, options, tsickleCompilerHostOptions, tsickleHost,
        {oldProgram: program, pass: Pass.DECORATOR_DOWNLEVEL});
    const f = host.getSourceFile(program.getRootFileNames()[0], ts.ScriptTarget.ES5);
    expect(f.text).to.contain('static decorators');
  });

  it(`doesn't transform .d.ts files`, () => {
    const [program, compilerHost, options] = makeProgram('foo.d.ts', 'declare let x: number;');
    const host = new TsickleCompilerHost(
        compilerHost, options, tsickleCompilerHostOptions, tsickleHost,
        {oldProgram: program, pass: Pass.CLOSURIZE});
    const f = host.getSourceFile(program.getRootFileNames()[0], ts.ScriptTarget.ES5);
    expect(f.text).to.match(/^declare let x: number/);
  });

  it(`does goog module rewriting`, () => {
    const jsFiles = new Map<string, string>();
    const options = {target: ts.ScriptTarget.ES5};
    const compilerHost = createOutputRetainingCompilerHost(jsFiles, ts.createCompilerHost(options));
    const host =
        new TsickleCompilerHost(compilerHost, options, tsickleCompilerHostOptions, tsickleHost);

    host.writeFile('foo.js', `console.log('hello');`, false);
    expect(jsFiles.get('foo.js'))
        .to.equal(
            `goog.module('foo');` +
            ` exports = {}; ` +
            `var module = {id: 'foo.js'};` +
            `console.log('hello');`);
  });
});
