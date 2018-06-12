/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import * as cliSupport from '../src/cli_support';
import * as tsickle from '../src/tsickle';

import {createAstPrintingTransform} from './ast_printing_transform';
import * as testSupport from './test_support';

const testCaseFileName = 'testcase.ts';

function sources(sourceText: string): Map<string, string> {
  const sources = new Map<string, string>([
    [testCaseFileName, sourceText],
    // Provides a rename of any 'FakeDecorator' that we can use as an annotator
    // without the compiler complaining we didn't actually provide a value
    [
      'bar.d.ts', `declare module "bar" {
      export class BarService {}
      type FakeDecorator = any;
    }`
    ]
  ]);
  return sources;
}

describe('decorator_downlevel_transformer', () => {
  beforeEach(() => {
    testSupport.addDiffMatchers();
  });
  function translate(sourceText: string, allowErrors = false) {
    const {host, program} =
        testSupport.createProgramAndHost(sources(sourceText), testSupport.compilerOptions);
    if (!allowErrors) {
      const diagnostics = ts.getPreEmitDiagnostics(program);
      testSupport.expectDiagnosticsEmpty(diagnostics);
    }

    const transformerHost: tsickle.TsickleHost = {
      shouldSkipTsickleProcessing: (filePath) => !sources(sourceText).has(filePath),
      pathToModuleName: cliSupport.pathToModuleName.bind(null, '/'),
      shouldIgnoreWarningsForPath: (filePath) => false,
      fileNameToModuleId: (filePath) => filePath,
      transformDecorators: true,
      transformTypesToClosure: false,
      googmodule: true,
      es5Mode: false,
      untyped: false,
      options: testSupport.compilerOptions,
      host,
    };

    const files = new Map<string, string>();
    const {diagnostics} = tsickle.emitWithTsickle(
        program, transformerHost, host, testSupport.compilerOptions, undefined,
        (path, contents) => {}, undefined, undefined,
        {beforeTs: [createAstPrintingTransform(files)]});

    if (!allowErrors) {
      testSupport.expectDiagnosticsEmpty(diagnostics);
    }

    return {output: files.get(testCaseFileName)!, diagnostics};
  }

  function expectUnchanged(sourceText: string) {
    expectTranslated(sourceText).toEqual(sourceText);
  }

  function expectTranslated(sourceText: string) {
    return expect(translate(sourceText).output);
  }

  describe('class decorator rewriter', () => {
    it('leaves plain classes alone', () => {
      expectUnchanged(`class Foo {
}
`);
    });

    it('leaves un-marked decorators alone', () => {
      expectUnchanged(`let Decor: any;
@Decor
class Foo {
    constructor(
    @Decor
    p: number) { }
    @Decor
    m(): void { }
}
`);
    });

    it('transforms decorated classes', () => {
      expectTranslated(`
import {FakeDecorator} from 'bar';
/** @Annotation */ let Test1: FakeDecorator;
/** @Annotation */ let Test2: FakeDecorator;
let param: any;
@Test1
@Test2(param)
class Foo {
  field: string;
}`).toBe(`import { FakeDecorator } from 'bar';
/** @Annotation */ let Test1: FakeDecorator;
/** @Annotation */ let Test2: FakeDecorator;
let param: any;
class Foo {
    field: string;
    static decorators: {
        type: Function;
        args?: any[];
    }[] = [
        { type: Test1 },
        { type: Test2, args: [param,] },
    ];
}
`);
    });

    it('transforms decorated classes with function expression annotation declaration', () => {
      expectTranslated(`
/** @Annotation */ function Test(t: any) {};
@Test
class Foo {
  field: string;
}`).toBe(`/** @Annotation */ function Test(t: any) { }
;
class Foo {
    field: string;
    static decorators: {
        type: Function;
        args?: any[];
    }[] = [
        { type: Test },
    ];
}
`);
    });

    it('transforms decorated classes with an exported annotation declaration', () => {
      expectTranslated(`
import {FakeDecorator} from 'bar';
/** @Annotation */ export let Test: FakeDecorator;
@Test
class Foo {
  field: string;
}`).toBe(`import { FakeDecorator } from 'bar';
/** @Annotation */ export let Test: FakeDecorator;
class Foo {
    field: string;
    static decorators: {
        type: Function;
        args?: any[];
    }[] = [
        { type: Test },
    ];
}
`);
    });

    it('accepts various complicated decorators', () => {
      expectTranslated(`
import {FakeDecorator} from 'bar';
/** @Annotation */ let Test1: FakeDecorator;
/** @Annotation */ let Test2: FakeDecorator;
/** @Annotation */ let Test3: FakeDecorator;
/** @Annotation */ function Test4<T>(param: any): ClassDecorator { return null as any; }
let param: any;
@Test1({name: 'percentPipe'}, class ZZZ {})
@Test2
@Test3()
@Test4<string>(param)
class Foo {
}`).toBe(`import { FakeDecorator } from 'bar';
/** @Annotation */ let Test1: FakeDecorator;
/** @Annotation */ let Test2: FakeDecorator;
/** @Annotation */ let Test3: FakeDecorator;
/** @Annotation */ function Test4<T>(param: any): ClassDecorator { return null as any; }
let param: any;
class Foo {
    static decorators: {
        type: Function;
        args?: any[];
    }[] = [
        { type: Test1, args: [{ name: 'percentPipe' }, class ZZZ {
                },] },
        { type: Test2 },
        { type: Test3 },
        { type: Test4, args: [param,] },
    ];
}
`);
    });

    it(`doesn't eat 'export'`, () => {
      expectTranslated(`
import {FakeDecorator} from 'bar';
/** @Annotation */ let Test1: FakeDecorator;
@Test1
export class Foo {
}`).toBe(`import { FakeDecorator } from 'bar';
/** @Annotation */ let Test1: FakeDecorator;
export class Foo {
    static decorators: {
        type: Function;
        args?: any[];
    }[] = [
        { type: Test1 },
    ];
}
`);
    });

    it(`handles nested classes`, () => {
      expectTranslated(`
import {FakeDecorator} from 'bar';
/** @Annotation */ let Test1: FakeDecorator;
/** @Annotation */ let Test2: FakeDecorator;
@Test1
export class Foo {
  foo() {
    @Test2
    class Bar {
    }
  }
}`).toBe(`import { FakeDecorator } from 'bar';
/** @Annotation */ let Test1: FakeDecorator;
/** @Annotation */ let Test2: FakeDecorator;
export class Foo {
    foo() {
        class Bar {
            static decorators: {
                type: Function;
                args?: any[];
            }[] = [
                { type: Test2 },
            ];
        }
    }
    static decorators: {
        type: Function;
        args?: any[];
    }[] = [
        { type: Test1 },
    ];
}
`);
    });
  });

  describe('ctor decorator rewriter', () => {
    it('ignores ctors that have no applicable injects', () => {
      expectUnchanged(`import { BarService } from 'bar';
class Foo {
    constructor(bar: BarService, num: number) {
    }
}
`);
    });

    it('transforms empty ctors', () => {
      expectTranslated(`
import {FakeDecorator} from 'bar';
/** @Annotation */ let Test1: FakeDecorator;
@Test1()
class Foo {
  constructor() {
  }
}`).toBe(`import { FakeDecorator } from 'bar';
/** @Annotation */ let Test1: FakeDecorator;
class Foo {
    constructor() {
    }
    static decorators: {
        type: Function;
        args?: any[];
    }[] = [
        { type: Test1 },
    ];
    /** @nocollapse */
    static ctorParameters: () => ({
        type: any;
        decorators?: {
            type: Function;
            args?: any[];
        }[];
    } | null)[] = () => [];
}
`);
    });

    it('transforms injected ctors', () => {
      expectTranslated(`
/** @Annotation */ let Inject: Function;
enum AnEnum { ONE, TWO, };
abstract class AbstractService {}
class Foo {
  constructor(@Inject bar: AbstractService, @Inject('enum') num: AnEnum) {
  }
}`).toBe(`/** @Annotation */ let Inject: Function;
enum AnEnum {
    ONE,
    TWO
}
;
abstract class AbstractService {
}
class Foo {
    constructor(bar: AbstractService, num: AnEnum) {
    }
    /** @nocollapse */
    static ctorParameters: () => ({
        type: any;
        decorators?: {
            type: Function;
            args?: any[];
        }[];
    } | null)[] = () => [
        { type: AbstractService, decorators: [{ type: Inject }] },
        { type: AnEnum, decorators: [{ type: Inject, args: ['enum',] }] }
    ];
}
`);
    });

    it('stores non annotated parameters if the class has at least one decorator', () => {
      expectTranslated(`
import {BarService, FakeDecorator} from 'bar';
/** @Annotation */ let Test1: FakeDecorator;
@Test1()
class Foo {
  constructor(bar: BarService, num: number) {
  }
}`).toBe(`import { BarService, FakeDecorator } from 'bar';
/** @Annotation */ let Test1: FakeDecorator;
class Foo {
    constructor(bar: BarService, num: number) {
    }
    static decorators: {
        type: Function;
        args?: any[];
    }[] = [
        { type: Test1 },
    ];
    /** @nocollapse */
    static ctorParameters: () => ({
        type: any;
        decorators?: {
            type: Function;
            args?: any[];
        }[];
    } | null)[] = () => [
        { type: BarService },
        { type: Number }
    ];
}
`);
    });

    it('handles complex ctor parameters', () => {
      expectTranslated(`
import * as bar from 'bar';
/** @Annotation */ let Inject: Function;
let param: any;
class Foo {
  constructor(@Inject(param) x: bar.BarService, {a, b}, defArg = 3, optional?: bar.BarService) {
  }
}`).toBe(`import * as bar from 'bar';
/** @Annotation */ let Inject: Function;
let param: any;
class Foo {
    constructor(x: bar.BarService, { a, b }, defArg = 3, optional?: bar.BarService) {
    }
    /** @nocollapse */
    static ctorParameters: () => ({
        type: any;
        decorators?: {
            type: Function;
            args?: any[];
        }[];
    } | null)[] = () => [
        { type: bar.BarService, decorators: [{ type: Inject, args: [param,] }] },
        null,
        null,
        { type: bar.BarService }
    ];
}
`);
    });

    it('includes decorators for primitive type ctor parameters', () => {
      expectTranslated(`
/** @Annotation */ let Inject: Function;
let APP_ID: any;
class ViewUtils {
  constructor(@Inject(APP_ID) private _appId: string) {}
}`).toBe(`/** @Annotation */ let Inject: Function;
let APP_ID: any;
class ViewUtils {
    constructor(private _appId: string) { }
    /** @nocollapse */
    static ctorParameters: () => ({
        type: any;
        decorators?: {
            type: Function;
            args?: any[];
        }[];
    } | null)[] = () => [
        { type: String, decorators: [{ type: Inject, args: [APP_ID,] }] }
    ];
}
`);
    });

    // Regression #674
    it('should leave annotations not down-leveled', () => {
      expectTranslated(`
        /** @Annotation */ var RemoveMe: Function = undefined as any;

        var KeepMe: Function = undefined as any;

        @KeepMe()
        @RemoveMe()
        class ViewUtils {
          constructor() {}
        }
        `).toBe(`/** @Annotation */ var RemoveMe: Function = undefined as any;
var KeepMe: Function = undefined as any;
@KeepMe()
class ViewUtils {
    constructor() { }
    static decorators: {
        type: Function;
        args?: any[];
    }[] = [
        { type: RemoveMe },
    ];
    /** @nocollapse */
    static ctorParameters: () => ({
        type: any;
        decorators?: {
            type: Function;
            args?: any[];
        }[];
    } | null)[] = () => [];
}
`);
    });

    it('strips generic type arguments', () => {
      expectTranslated(`
/** @Annotation */ let Inject: Function;
class Foo {
  constructor(@Inject typed: Promise<string>) {
  }
}`).toBe(`/** @Annotation */ let Inject: Function;
class Foo {
    constructor(typed: Promise<string>) {
    }
    /** @nocollapse */
    static ctorParameters: () => ({
        type: any;
        decorators?: {
            type: Function;
            args?: any[];
        }[];
    } | null)[] = () => [
        { type: Promise, decorators: [{ type: Inject }] }
    ];
}
`);
    });

    it('avoids using interfaces as values', () => {
      expectTranslated(`
/** @Annotation */ let Inject: Function = (null as any);
class Class {}
interface Iface {}
class Foo {
  constructor(@Inject aClass: Class, @Inject aIface: Iface) {}
}`).toBe(`/** @Annotation */ let Inject: Function = (null as any);
class Class {
}
interface Iface {
}
class Foo {
    constructor(aClass: Class, aIface: Iface) { }
    /** @nocollapse */
    static ctorParameters: () => ({
        type: any;
        decorators?: {
            type: Function;
            args?: any[];
        }[];
    } | null)[] = () => [
        { type: Class, decorators: [{ type: Inject }] },
        { type: undefined, decorators: [{ type: Inject }] }
    ];
}
`);
    });
  });

  describe('method decorator rewriter', () => {
    it('leaves ordinary methods alone', () => {
      expectUnchanged(`class Foo {
    bar() { }
}
`);
    });

    it('gathers decorators from methods', () => {
      expectTranslated(`
/** @Annotation */ let Test1: Function;
class Foo {
  @Test1('somename')
  bar() {}
}`).toBe(`/** @Annotation */ let Test1: Function;
class Foo {
    bar() { }
    static propDecorators: {
        [key: string]: {
            type: Function;
            args?: any[];
        }[];
    } = {
        bar: [{ type: Test1, args: ['somename',] }]
    };
}
`);
    });

    it('gathers decorators from fields and setters', () => {
      expectTranslated(`
/** @Annotation */ let PropDecorator: Function;
class ClassWithDecorators {
  @PropDecorator("p1") @PropDecorator("p2") a;
  b;

  @PropDecorator("p3")
  set c(value) {}
}`).toBe(`/** @Annotation */ let PropDecorator: Function;
class ClassWithDecorators {
    a;
    b;
    set c(value) { }
    static propDecorators: {
        [key: string]: {
            type: Function;
            args?: any[];
        }[];
    } = {
        a: [{ type: PropDecorator, args: ["p1",] }, { type: PropDecorator, args: ["p2",] }],
        c: [{ type: PropDecorator, args: ["p3",] }]
    };
}
`);
    });

    it('errors on weird class members', () => {
      const {diagnostics} = translate(
          `
/** @Annotation */ let Test1: Function;
let param: any;
class Foo {
  @Test1('somename')
  [param]() {}
}`,
          true /* allow errors */);

      expect(testSupport.formatDiagnostics(diagnostics))
          .toBe(
              'testcase.ts(5,3): error TS0: cannot process decorators on strangely named method\n');
    });
    it('avoids mangling code relying on ASI', () => {
      expectTranslated(`
/** @Annotation */ let PropDecorator: Function;
class Foo {
  missingSemi = () => {}
  @PropDecorator other: number;
}`).toBe(`/** @Annotation */ let PropDecorator: Function;
class Foo {
    missingSemi = () => { };
    other: number;
    static propDecorators: {
        [key: string]: {
            type: Function;
            args?: any[];
        }[];
    } = {
        other: [{ type: PropDecorator }]
    };
}
`);
    });
  });
});
