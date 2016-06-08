import {expect} from 'chai';

import {convertDecorators} from '../src/decorator-annotator';
import * as tsickle from '../src/tsickle';

import * as test_support from './test_support';

const testCaseFileName = 'testcase.ts';

// When we verify that the produced code compiles, we need to provide a definition
// of DecoratorInvocation.
const testSupportCode = `
interface DecoratorInvocation {
  type: Function;
  args?: any[];
}
`;

function sources(sourceText: string): {[fileName: string]: string} {
  return {
    [testCaseFileName]: sourceText,
    'bar.d.ts': 'declare module "bar" { export class BarService {} }'
  };
}

function verifyCompiles(sourceText: string) {
  // This throws an exception on error.
  test_support.createProgram(sources(testSupportCode + sourceText));
}

describe(
    'decorator-annotator', () => {
      function translate(sourceText: string, allowErrors = false) {
        let program = test_support.createProgram(sources(sourceText));
        let {output, diagnostics} =
            convertDecorators(program.getTypeChecker(), program.getSourceFile(testCaseFileName));
        if (!allowErrors) expect(diagnostics).to.be.empty;
        verifyCompiles(output);
        return {output, diagnostics};
      }

      describe('class decorator rewriter', () => {
        it('leaves plain classes alone',
           () => { expect(translate(`class Foo {}`).output).to.equal(`class Foo {}`); });

        it('transforms decorated classes', () => {
          expect(translate(`
let Test1: Function;
let Test2: Function;
let param: any;
@Test1
@Test2(param)
class Foo {
  field: string;
}`).output).to.equal(`
let Test1: Function;
let Test2: Function;
let param: any;
class Foo {
  field: string;
/** @nocollapse */
static decorators: DecoratorInvocation[] = [
{ type: Test1 },
{ type: Test2, args: [param, ] },
];
}`);
        });

        it('accepts various complicated decorators', () => {
          expect(translate(`
let Test1: Function;
let Test2: Function;
let Test3: Function;
function Test4<T>(param: any): ClassDecorator { return null; }
let param: any;
@Test1({name: 'percentPipe'}, class ZZZ {})
@Test2
@Test3()
@Test4<string>(param)
class Foo {
}`).output).to.equal(`
let Test1: Function;
let Test2: Function;
let Test3: Function;
function Test4<T>(param: any): ClassDecorator { return null; }
let param: any;
class Foo {
/** @nocollapse */
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
let Test1: Function;
@Test1
export class Foo {
}`).output).to.equal(`
let Test1: Function;
export class Foo {
/** @nocollapse */
static decorators: DecoratorInvocation[] = [
{ type: Test1 },
];
}`);
        });

        it(`handles nested classes`, () => {
          expect(translate(`
let Test1: Function;
let Test2: Function;
@Test1
export class Foo {
  foo() {
    @Test2
    class Bar {
    }
  }
}`).output).to.equal(`
let Test1: Function;
let Test2: Function;
export class Foo {
  foo() {
    class Bar {
    /** @nocollapse */
static decorators: DecoratorInvocation[] = [
{ type: Test2 },
];
}
  }
/** @nocollapse */
static decorators: DecoratorInvocation[] = [
{ type: Test1 },
];
}`);
        });
      });

      describe('ctor decorator rewriter', () => {
        it('ignores ctors that have no applicable injects', () => {
          expect(translate(`
import {BarService} from 'bar';
class Foo {
  constructor(bar: BarService, num: number) {
  }
}`).output).to.equal(`
import {BarService} from 'bar';
class Foo {
  constructor(bar: BarService, num: number) {
  }
}`);
        });

        it('transforms injected ctors', () => {
          expect(translate(`
let Inject: Function;
abstract class AbstractService {}
class Foo {
  constructor(@Inject bar: AbstractService, num: number) {
  }
}`).output).to.equal(`
let Inject: Function;
abstract class AbstractService {}
class Foo {
  constructor( bar: AbstractService, num: number) {
  }
/** @nocollapse */
static ctorParameters: {type: Function, decorators?: DecoratorInvocation[]}[] = [
{type: AbstractService, decorators: [{ type: Inject }, ]},
null,
];
}`);
        });

        it('stores non annotated parameters if the class has at least one decorator', () => {
          expect(translate(`
import {BarService} from 'bar';
let Test1: Function;
@Test1()
class Foo {
  constructor(bar: BarService, num: number) {
  }
}`).output).to.equal(`
import {BarService} from 'bar';
let Test1: Function;
class Foo {
  constructor(bar: BarService, num: number) {
  }
/** @nocollapse */
static decorators: DecoratorInvocation[] = [
{ type: Test1 },
];
/** @nocollapse */
static ctorParameters: {type: Function, decorators?: DecoratorInvocation[]}[] = [
{type: BarService, },
null,
];
}`);
        });

        it('handles complex ctor parameters', () => {
          expect(translate(`
import * as bar from 'bar';
let Inject: Function;
let param: any;
class Foo {
  constructor(@Inject(param) x: bar.BarService, {a, b}, defArg = 3, optional?: bar.BarService) {
  }
}`).output).to.equal(`
import * as bar from 'bar';
let Inject: Function;
let param: any;
class Foo {
  constructor( x: bar.BarService, {a, b}, defArg = 3, optional?: bar.BarService) {
  }
/** @nocollapse */
static ctorParameters: {type: Function, decorators?: DecoratorInvocation[]}[] = [
{type: bar.BarService, decorators: [{ type: Inject, args: [param, ] }, ]},
null,
null,
{type: bar.BarService, },
];
}`);
        });

        it('includes decorators for primitive type ctor parameters', () => {
          expect(translate(`
let Inject: Function;
let APP_ID: any;
class ViewUtils {
  constructor(@Inject(APP_ID) private _appId: string) {}
}`).output).to.equal(`
let Inject: Function;
let APP_ID: any;
class ViewUtils {
  constructor( private _appId: string) {}
/** @nocollapse */
static ctorParameters: {type: Function, decorators?: DecoratorInvocation[]}[] = [
{type: undefined, decorators: [{ type: Inject, args: [APP_ID, ] }, ]},
];
}`);
        });

        it('strips generic type arguments', () => {
          expect(translate(`
let Inject: Function;
class Foo {
  constructor(@Inject typed: Promise<string>) {
  }
}`).output).to.equal(`
let Inject: Function;
class Foo {
  constructor( typed: Promise<string>) {
  }
/** @nocollapse */
static ctorParameters: {type: Function, decorators?: DecoratorInvocation[]}[] = [
{type: Promise, decorators: [{ type: Inject }, ]},
];
}`);
        });

        it('avoids using interfaces as values', () => {
          expect(translate(`
let Inject: Function = null;
class Class {}
interface Iface {}
class Foo {
  constructor(@Inject aClass: Class, @Inject aIface: Iface) {}
}`).output).to.equal(`
let Inject: Function = null;
class Class {}
interface Iface {}
class Foo {
  constructor( aClass: Class, aIface: Iface) {}
/** @nocollapse */
static ctorParameters: {type: Function, decorators?: DecoratorInvocation[]}[] = [
{type: Class, decorators: [{ type: Inject }, ]},
{type: undefined, decorators: [{ type: Inject }, ]},
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
let Test1: Function;
class Foo {
  @Test1('somename')
  bar() {}
}`).output).to.equal(`
let Test1: Function;
class Foo {
  bar() {}
/** @nocollapse */
static propDecorators: {[key: string]: DecoratorInvocation[]} = {
'bar': [{ type: Test1, args: ['somename', ] },],
};
}`);
        });

        it('gathers decorators from fields and setters', () => {
          expect(translate(`
let PropDecorator: Function;
class ClassWithDecorators {
  @PropDecorator("p1") @PropDecorator("p2") a;
  b;

  @PropDecorator("p3")
  set c(value) {}
}`).output).to.equal(`
let PropDecorator: Function;
class ClassWithDecorators { a;
  b;
  set c(value) {}
/** @nocollapse */
static propDecorators: {[key: string]: DecoratorInvocation[]} = {
'a': [{ type: PropDecorator, args: ["p1", ] },{ type: PropDecorator, args: ["p2", ] },],
'c': [{ type: PropDecorator, args: ["p3", ] },],
};
}`);
        });

        it('errors on weird class members', () => {
          let {diagnostics} = translate(
              `
let Test1: Function;
let param: any;
class Foo {
  @Test1('somename')
  [param]() {}
}`,
              true /* allow errors */);

          expect(tsickle.formatDiagnostics(diagnostics))
              .to.equal(
                  'Error at testcase.ts:5:3: cannot process decorators on ComputedPropertyName');
        });

      });


    });
