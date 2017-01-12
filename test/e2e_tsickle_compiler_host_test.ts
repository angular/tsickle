import {expect} from 'chai';
import * as ts from 'typescript';

import {pathToModuleName} from '../src/cli_support';
import {Pass, TsickleCompilerHost, TsickleCompilerHostOptions, TsickleEnvironment} from '../src/tsickle_compiler_host';
import {createSourceReplacingCompilerHost} from '../src/util';
import {formatDiagnostics} from '../src/tsickle';

function createTsickleCompilerHostOptions(): TsickleCompilerHostOptions {
  return {
    googmodule: false,
    es5Mode: false,
    tsickleTyped: false,
    prelude: '',
  };
}

function createTsickleEnvironment(): TsickleEnvironment {
  return {
    shouldSkipTsickleProcessing: (fileName) => false,
    pathToModuleName: pathToModuleName,
    shouldIgnoreWarningsForPath: (filePath) => false,
  };
}

describe('tsickle compiler host', () => {
  function makeProgram(fileName: string, source: string): [ts.Program, ts.CompilerHost] {
    // TsickleCompilerHost wants a ts.Program, which is the result of
    // parsing and typechecking the code before tsickle processing.
    // So we must create and run the entire stack of CompilerHost.
    let compilerHostDelegate = ts.createCompilerHost({target: ts.ScriptTarget.ES5});
    const sources = new Map<string, string>();
    sources.set(ts.sys.resolvePath(fileName), source);
    let compilerHost = createSourceReplacingCompilerHost(sources, compilerHostDelegate);
    let program = ts.createProgram([fileName], {experimentalDecorators: true}, compilerHost);
    // To get types resolved, you must first call getPreEmitDiagnostics.
    let diags = formatDiagnostics(ts.getPreEmitDiagnostics(program));
    expect(diags).to.equal('');
    return [program, compilerHost];
  }

  it('applies tsickle transforms', () => {
    const [program, compilerHost] = makeProgram('foo.ts', 'let x: number = 123;');
    const host = new TsickleCompilerHost(
        compilerHost, createTsickleCompilerHostOptions(), createTsickleEnvironment(), program,
        Pass.Tsickle);
    const f = host.getSourceFile(program.getRootFileNames()[0], ts.ScriptTarget.ES5);
    // NOTE(evanm): currently tsickle just removes all types; we will
    // likely revisit this.
    expect(f.text).to.contain('/** @type {?} */');
  });

  it('lowers decorators to annotations', () => {
    const [program, compilerHost] =
        makeProgram('foo.ts', '/** @Annotation */ const A: Function = null; @A class B {}');
    const host = new TsickleCompilerHost(
        compilerHost, createTsickleCompilerHostOptions(), createTsickleEnvironment(), program,
        Pass.DecoratorDownlevel);
    const f = host.getSourceFile(program.getRootFileNames()[0], ts.ScriptTarget.ES5);
    expect(f.text).to.contain('static decorators');
  });

  it(`doesn't transform .d.ts files`, () => {
    const [program, compilerHost] = makeProgram('foo.d.ts', 'declare let x: number;');
    const host = new TsickleCompilerHost(
        compilerHost, createTsickleCompilerHostOptions(), createTsickleEnvironment(), program,
        Pass.Tsickle);
    const f = host.getSourceFile(program.getRootFileNames()[0], ts.ScriptTarget.ES5);
    expect(f.text).to.match(/^declare let x: number/);
  });

  it(`does goog module rewriting`, () => {
    const [program, compilerHost] = makeProgram('foo.ts', `console.log('hello');`);
    const compilerHostOptions = {
      googmodule: true,
      es5Mode: false,
      tsickleTyped: false,
      prelude: '',
    };
    const jsFiles = new Map<string, string>();
    function writeFile(fileName: string, data: string): void {
      jsFiles.set(fileName, data);
    }

    compilerHost.writeFile = writeFile;
    const host =
        new TsickleCompilerHost(compilerHost, compilerHostOptions, createTsickleEnvironment());
    const f = host.getSourceFile(program.getRootFileNames()[0], ts.ScriptTarget.ES5);

    host.writeFile(f.fileName, f.text, false);
    expect(jsFiles.get('foo.ts'))
        .to.equal(
            `goog.module('foo');` +
            ` exports = {}; ` +
            `var module = {id: 'foo'};` +
            `console.log('hello');`);
  });
});
