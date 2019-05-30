// This d.ts file is a script (that is, not a module).
// See declare_module.d.ts for the module version.

declare namespace DeclareTestModule {
  namespace inner {
    var someBool: boolean;
  }

  interface Foo {
    field: string;
    method(a: string): number;
  }

  type FooConstructor = { new(f: string): Foo; }

  function makeFoo(f: string): Foo;

  var fooMaker: FooConstructor;

  class Clazz {
    constructor(a: number);
    /** Comment */
    method(a: string): number;
    
    makeFoo: {new(f: string): Foo};

    makeFoo2: FooConstructor;

    static staticMethod(a: string): number;

    static field: number;
  }

  // TODO: static/non-static method signatures collide.
  class Example {
    static methodA(): number;
    methodA(): string;
  }

  interface NotYetHandled {
    [key: string]: string;
  }

  type TypeAlias = string|number;
}

// This module is quoted, which declares an importable module.
// We can't model this in externs beyond making sure it's declared
// in *some* namespace;
declare module 'DeclareTest-QuotedModule' {
  var foo: string;
}

declare var declareGlobalVar: number;
declare function declareGlobalFunction(x: string): number;

declare interface DeclareTestInterface {
  foo: string;
}

// Should be omitted from externs -- conflicts with Closure.
declare var global: any;
declare interface exports {}

// A class with an overloaded constructor.
declare class MultipleConstructors {
  constructor();
  constructor(a: number);
}

// Add to an existing interface; we shouldn't redeclare Object
// itself, but we still should declare the method.
declare interface Object {
  myMethod();
}

// An overloaded function that is also used as a namespace.
declare function CodeMirror(x: string): CodeMirror.Editor;
declare function CodeMirror(y: number, x: string): CodeMirror.Editor;
declare module CodeMirror {
  interface Editor {
    name: string;
  }
}

// Test overloaded functions with confusing parameter names.
declare function redirect(url: string): void;
declare function redirect(status: number, url: string): void;
declare function redirect(url: string, status: number): void;

// Test an overload with a rest param occurring before an ordinary function.
declare function TestOverload(a: number, ...b: any[]): string;
declare function TestOverload(a: number, b: string, c: string): string;

// Test an overload with a rest param unioning with an optional param.
declare function TestOverload2(a: number, ...b: any[]): void;
declare function TestOverload2(a: number, b?: string): void;

// An interface that is not tagged with "declare", but exists in a
// d.ts file so it should show up in the externs anyway.
interface BareInterface {
  name: string;
}

// Don't use a parameter named "arguments"; it's illegal in Closure.
declare function usesArguments(arguments: string);

// Avoid a Closure crash with destructuring.
declare function destructures({a: number});

// Properly generate top-level enums.
declare enum ChartType { line, bar }

// Should be dropped; redundant with Closure builtins.
interface ErrorConstructor {
  foo(): void;
}

// Verify that when the constructor has params, we don't drop that the class
// has a template param (in the externs, both are expressed on the ctor).
declare class Container<T> {
  value: T;
  constructor(t: T);
}

// Verify that optional 'any' comes out as {?|undefined}.
declare interface OptionalAny {
  optionalAny?: any;
  optionalString?: string;
}
