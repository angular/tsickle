import * as ts from 'typescript';
import {convertDecorators} from '../src/decorator-annotator';
import {expect} from 'chai';
import * as tsickle from '../src/tsickle';

/**
 * If true, attempt to compile all the test cases.
 * Off by default because compilation takes a long time, and the test cases
 * as currently produced are all valid.
 */
const checkCompilation = false;

const testCaseFileName = 'testcase.ts';

// If we verify the produced code compiles, this blob of code is some scaffolding
// of some types and variables used in the test cases so the compiler likes it.
const testSupportCode = `
interface DecoratorInvocation {
  type: Function;
  args?: any[];
}

let Test1: Function;
let Test2: Function;
let Test3: Function;
let Test4: Function;
let Inject: Function;
let param: any;
class BarService {}
abstract class AbstractService {}
`;

function verifyCompiles(sourceText: string) {
  let compilerOptions: ts.CompilerOptions = {
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
  };
  let host = ts.createCompilerHost(compilerOptions);
  let origGetSourceFile = host.getSourceFile;
  host.getSourceFile = function(fileName: string, languageVersion: ts.ScriptTarget): ts.SourceFile {
    if (fileName === testCaseFileName) {
      sourceText = testSupportCode + sourceText;
      return ts.createSourceFile(fileName, sourceText, languageVersion, true);
    }
    return origGetSourceFile(fileName, languageVersion);
  };
  let program = ts.createProgram([testCaseFileName], compilerOptions, host);
  let errors = ts.getPreEmitDiagnostics(program);
  if (errors.length > 0) {
    console.error(sourceText);
    console.error(tsickle.formatDiagnostics(errors));
  }
}

describe(
    'decorator-annotator', () => {
      function translate(sourceText: string, allowErrors = false) {
        let {output, diagnostics} = convertDecorators(testCaseFileName, sourceText);
        if (!allowErrors) expect(diagnostics).to.be.empty;
        if (checkCompilation) verifyCompiles(output);
        return {output, diagnostics};
      }

      describe('class decorator rewriter', () => {
        it('leaves plain classes alone',
           () => { expect(translate(`class Foo {}`).output).to.equal(`class Foo {}`); });

        it('transforms decorated classes', () => {
          expect(translate(`
@Test1
@Test2(param)
class Foo {
  field: string;
}`).output).to.equal(`
class Foo {
  field: string;
static decorators: DecoratorInvocation[] = [
{ type: Test1 },
{ type: Test2, args: [param, ] },
];
}`);
        });

        it('accepts various complicated decorators', () => {
          expect(translate(`
@Test1({name: 'percentPipe'}, class ZZZ {})
@Test2
@Test3()
@Test4<T>(param)
class Foo {
}`).output).to.equal(`
class Foo {
static decorators: DecoratorInvocation[] = [
{ type: Test1, args: [{name: 'percentPipe'}, class ZZZ {}, ] },
{ type: Test2 },
{ type: Test3 },
{ type: Test4, args: [param, ] },
];
}`);
        });

        it(`doesn't eat 'export'`, () => {
          expect(translate(`
@Test1
export class Foo {
}`).output).to.equal(`
export class Foo {
static decorators: DecoratorInvocation[] = [
{ type: Test1 },
];
}`);
        });

        it(`handles nested classes`, () => {
          expect(translate(`
@Test1
export class Foo {
  foo() {
    @Test2
    class Bar {
    }
  }
}`).output).to.equal(`
export class Foo {
  foo() {
    class Bar {
    static decorators: DecoratorInvocation[] = [
{ type: Test2 },
];
}
  }
static decorators: DecoratorInvocation[] = [
{ type: Test1 },
];
}`);
        });
      });

      describe('ctor decorator rewriter', () => {
        it('ignores ctors that have no applicable injects', () => {
          expect(translate(`
class Foo {
  constructor(bar: BarService, num: number) {
  }
}`).output).to.equal(`
class Foo {
  constructor(bar: BarService, num: number) {
  }
}`);
        });

        it('transforms injected ctors', () => {
          expect(translate(`
class Foo {
  constructor(@Inject bar: AbstractService, num: number) {
  }
}`).output).to.equal(`
class Foo {
  constructor( bar: AbstractService, num: number) {
  }
static ctorParameters: {type: Function, decorators?: DecoratorInvocation[]}[] = [
{type: AbstractService, decorators: [{ type: Inject }, ]},
null,
];
}`);
        });

        it('stores non annotated parameters if the class has at least one decorator', () => {
          expect(translate(`
@Test1()
class Foo {
  constructor(bar: BarService, num: number) {
  }
}`).output).to.equal(`
class Foo {
  constructor(bar: BarService, num: number) {
  }
static decorators: DecoratorInvocation[] = [
{ type: Test1 },
];
static ctorParameters: {type: Function, decorators?: DecoratorInvocation[]}[] = [
{type: BarService, },
null,
];
}`);
        });

        it('handles complex ctor parameters', () => {
          expect(translate(`
class Foo {
  constructor(@Inject(param) x: BarService, {a, b}, defArg = 3, optional?: BarService) {
  }
}`).output).to.equal(`
class Foo {
  constructor( x: BarService, {a, b}, defArg = 3, optional?: BarService) {
  }
static ctorParameters: {type: Function, decorators?: DecoratorInvocation[]}[] = [
{type: BarService, decorators: [{ type: Inject, args: [param, ] }, ]},
null,
null,
{type: BarService, },
];
}`);
        });

        it('strips generic type arguments', () => {
          expect(translate(`
class Foo {
  constructor(@Inject typed: Promise<string>) {
  }
}`).output).to.equal(`
class Foo {
  constructor( typed: Promise<string>) {
  }
static ctorParameters: {type: Function, decorators?: DecoratorInvocation[]}[] = [
{type: Promise, decorators: [{ type: Inject }, ]},
];
}`);
        });
      });

      describe('method decorator rewriter', () => {
        it('leaves ordinary methods alone', () => {
          expect(translate(`
class Foo {
  bar() {}
}`).output).to.equal(`
class Foo {
  bar() {}
}`);
        });

        it('gathers decorators from methods', () => {
          expect(translate(`
class Foo {
  @Test1('somename')
  bar() {}
}`).output).to.equal(`
class Foo {
  bar() {}
static propDecorators: {[key: string]: DecoratorInvocation[]} = {
'bar': [{ type: Test1, args: ['somename', ] },],
};
}`);
        });

        it('errors on weird class members', () => {
          let {diagnostics} = translate(
              `
class Foo {
  @Test1('somename')
  [param]() {}
}`,
              true /* allow errors */);

          expect(tsickle.formatDiagnostics(diagnostics))
              .to.equal(
                  'Error at testcase.ts:3:3: cannot process decorators on ComputedPropertyName');
        });

      });


    });
