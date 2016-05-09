Error at test_files/declare.in.ts:17:5: IndexSignature not implemented in externs for interface
====
declare namespace DeclareTestModule {
  namespace inner {
    var someBool: boolean;
  }

  interface Foo {
    field: string;
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
