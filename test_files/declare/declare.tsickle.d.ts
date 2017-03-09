Warning at test_files/declare/declare.d.ts:92:1: anonymous type has no symbol
====
declare namespace DeclareTestModule {
  namespace inner {
    var someBool: boolean;
  }

  interface Foo {
    field: string;
    method(a: string): number;
  }

  class Clazz {
    constructor(a: number);
    /** Comment */
    method(a: string): number;
  }

  interface NotYetHandled {
    [key: string]: string;
  }

  enum Enumeration {
    Value1 = 2,
    Value3
  }

  enum StringEnum {
    'foo',
    '.tricky.invalid name',
  }

  type TypeAlias = string | number;
}

// This module is quoted, which declares an importable module.
// We can't model this in externs beyond making sure it's declared
// in *some* namespace;
declare module "DeclareTest-QuotedModule" {
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
declare enum ChartType {
    line, bar
}

// Should be dropped; redundant with Closure builtins.
interface ErrorConstructor {
  foo(): void;
}
