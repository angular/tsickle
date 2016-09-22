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

// This module is quoted, so it shouldn't show up in externs.js.
declare module "DeclareTestQuotedModule" {
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

// An interface that is not tagged with "declare", but exists in a
// d.ts file so it should show up in the externs anyway.
interface BareInterface {
  name: string;
}

// Don't use a parameter named "arguments"; it's illegal in Closure.
declare function usesArguments(arguments: string);
