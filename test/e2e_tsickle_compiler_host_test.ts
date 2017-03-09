import {expect} from 'chai';
import * as ts from 'typescript';

import {pathToModuleName} from '../src/cli_support';
import {formatDiagnostics} from '../src/tsickle';
import {Options, Pass, TsickleCompilerHost} from '../src/tsickle_compiler_host';
import {createOutputRetainingCompilerHost, createSourceReplacingCompilerHost} from '../src/util';

const tsickleHost = {
  shouldSkipTsickleProcessing: (fileName: string) => false,
  pathToModuleName: pathToModuleName,
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
    sources.set(ts.sys.resolvePath(fileName), source);
    return makeMultiFileProgram(sources);
  }

  function makeMultiFileProgram(sources: Map<string, string>):
      [ts.Program, ts.CompilerHost, ts.CompilerOptions] {
    // TsickleCompilerHost wants a ts.Program, which is the result of
    // parsing and typechecking the code before tsickle processing.
    // So we must create and run the entire stack of CompilerHost.
    let options: ts.CompilerOptions = {target: ts.ScriptTarget.ES5};
    let compilerHostDelegate = ts.createCompilerHost(options);
    let compilerHost = createSourceReplacingCompilerHost(sources, compilerHostDelegate);
    let program =
        ts.createProgram(Array.from(sources.keys()), {experimentalDecorators: true}, compilerHost);
    // To get types resolved, you must first call getPreEmitDiagnostics.
    let diags = formatDiagnostics(ts.getPreEmitDiagnostics(program));
    expect(diags).to.equal('');
    return [program, compilerHost, options];
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
      [ts.sys.resolvePath('foo.ts'), 'let b: Banned = {b: "a"};'],
      [ts.sys.resolvePath('banned.d.ts'), 'declare interface Banned { b: string }'],
    ]);
    const [program, compilerHost, options] = makeMultiFileProgram(sources);
    tsickleCompilerHostOptions.typeBlackListPaths = new Set([ts.sys.resolvePath('banned.d.ts')]);
    tsickleCompilerHostOptions.untyped = false;
    const host =
        new TsickleCompilerHost(compilerHost, options, tsickleCompilerHostOptions, tsickleHost);
    host.reconfigureForRun(program, Pass.CLOSURIZE);
    const f = host.getSourceFile(program.getRootFileNames()[0], ts.ScriptTarget.ES5);
    expect(f.text).to.contain('/** @type {?} */ b: Banned');
  });

  it('lowers decorators to annotations', () => {
    const [program, compilerHost, options] =
        makeProgram('foo.ts', '/** @Annotation */ const A: Function = null; @A class B {}');
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
});
