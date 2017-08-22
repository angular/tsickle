import {expect} from 'chai';
import * as ts from 'typescript';

import {pathToModuleName} from '../src/cli_support';
import {formatDiagnostics} from '../src/tsickle';
import {Options, Pass, TsickleCompilerHost} from '../src/tsickle_compiler_host';
import {createOutputRetainingCompilerHost} from '../src/util';

import {compilerOptions, createProgramAndHost} from './test_support';

const tsickleHost = {
  shouldSkipTsickleProcessing: (fileName: string) => false,
  pathToModuleName,
  shouldIgnoreWarningsForPath: (filePath: string) => false,
  fileNameToModuleId: (fileName: string) => fileName,
};

describe('tsickle compiler host', () => {
  let tsickleCompilerHostOptions: Options;

  beforeEach(() => {
    tsickleCompilerHostOptions = {
      googmodule: true,
      es5Mode: false,
      untyped: true,
      typeBlackListPaths: new Set(),
      prelude: '',
    };
  });

  function makeProgram(
      fileName: string, source: string): [ts.Program, ts.CompilerHost, ts.CompilerOptions] {
    const sources = new Map<string, string>();
    sources.set(fileName, source);
    return makeMultiFileProgram(sources);
  }

  function makeMultiFileProgram(sources: Map<string, string>):
      [ts.Program, ts.CompilerHost, ts.CompilerOptions] {
    // TsickleCompilerHost wants a ts.Program, which is the result of
    // parsing and typechecking the code before tsickle processing.
    // So we must create and run the entire stack of CompilerHost.
    const options = compilerOptions;
    const {host, program} = createProgramAndHost(sources, options);
    // To get types resolved, you must first call getPreEmitDiagnostics.
    const diags = formatDiagnostics(ts.getPreEmitDiagnostics(program));
    expect(diags).to.equal('');
    return [program, host, options];
  }

  it('applies tsickle transforms', () => {
    const [program, compilerHost, options] = makeProgram('foo.ts', 'let x: number = 123;');
    const host =
        new TsickleCompilerHost(compilerHost, options, tsickleCompilerHostOptions, tsickleHost);
    host.reconfigureForRun(program, Pass.CLOSURIZE);
    const f = host.getSourceFile(program.getRootFileNames()[0], ts.ScriptTarget.ES5);
    expect(f.text).to.contain('/** @type {?} */');
  });

  it('applies tsickle transforms with types', () => {
    const [program, compilerHost, options] = makeProgram('foo.ts', 'let x: number = 123;');
    tsickleCompilerHostOptions.untyped = false;
    const host =
        new TsickleCompilerHost(compilerHost, options, tsickleCompilerHostOptions, tsickleHost);
    host.reconfigureForRun(program, Pass.CLOSURIZE);
    const f = host.getSourceFile(program.getRootFileNames()[0], ts.ScriptTarget.ES5);
    expect(f.text).to.contain('/** @type {number} */');
  });

  it('passes blacklisted paths', () => {
    const sources = new Map<string, string>([
      ['foo.ts', 'let b: Banned = {b: "a"};'],
      ['banned.d.ts', 'declare interface Banned { b: string }'],
    ]);
    const [program, compilerHost, options] = makeMultiFileProgram(sources);
    tsickleCompilerHostOptions.typeBlackListPaths = new Set(['banned.d.ts']);
    tsickleCompilerHostOptions.untyped = false;
    const host =
        new TsickleCompilerHost(compilerHost, options, tsickleCompilerHostOptions, tsickleHost);
    host.reconfigureForRun(program, Pass.CLOSURIZE);
    const f = host.getSourceFile(program.getRootFileNames()[0], ts.ScriptTarget.ES5);
    expect(f.text).to.contain('/** @type {?} */ b: Banned');
  });

  it('lowers decorators to annotations', () => {
    const [program, compilerHost, options] =
        makeProgram('foo.ts', '/** @Annotation */ function A(t: any) {return t}; @A class B {}');
    const host =
        new TsickleCompilerHost(compilerHost, options, tsickleCompilerHostOptions, tsickleHost);
    host.reconfigureForRun(program, Pass.DECORATOR_DOWNLEVEL);
    const f = host.getSourceFile(program.getRootFileNames()[0], ts.ScriptTarget.ES5);
    expect(f.text).to.contain('static decorators');
  });

  it(`doesn't transform .d.ts files`, () => {
    const [program, compilerHost, options] = makeProgram('foo.d.ts', 'declare let x: number;');
    const host =
        new TsickleCompilerHost(compilerHost, options, tsickleCompilerHostOptions, tsickleHost);
    host.reconfigureForRun(program, Pass.CLOSURIZE);
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

  it(`reports tsickle errors from multiple files`, () => {
    const sources = new Map<string, string>([
      ['a.ts', '/** @return {number} */ function a(): number { return 1; }'],
      ['b.ts', '/** @return {number} */ function b(): number { return 1; }'],
    ]);
    const [program, compilerHost, options] = makeMultiFileProgram(sources);
    const host =
        new TsickleCompilerHost(compilerHost, options, tsickleCompilerHostOptions, tsickleHost);

    host.reconfigureForRun(program, Pass.CLOSURIZE);
    host.getSourceFile(program.getRootFileNames()[0], ts.ScriptTarget.ES5);
    host.getSourceFile(program.getRootFileNames()[1], ts.ScriptTarget.ES5);

    expect(host.diagnostics.length).to.eq(2);
    expect(host.diagnostics[0].file.fileName).to.match(/a\.ts$/);
    expect(host.diagnostics[1].file.fileName).to.match(/b\.ts$/);
  });

  it(`resets tsickle errors on reconfigure`, () => {
    const [program, compilerHost, options] =
        makeProgram('a.ts', '/** @return {number} */ function a(): number { return 1; }');
    const host =
        new TsickleCompilerHost(compilerHost, options, tsickleCompilerHostOptions, tsickleHost);
    host.reconfigureForRun(program, Pass.CLOSURIZE);
    host.getSourceFile(program.getRootFileNames()[0], ts.ScriptTarget.ES5);
    expect(host.diagnostics.length).to.eq(1);

    host.reconfigureForRun(program, Pass.CLOSURIZE);

    expect(host.diagnostics.length).to.eq(0);
  });
});
