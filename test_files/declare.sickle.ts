Error at test_files/declare.in.ts:11:5: IndexSignature not implemented in externs for interface
====
declare namespace DeclareTestModule {
  namespace inner {
    var someBool: boolean;
  }

  interface Foo {
    field: string;
  }

  interface NotYetHandled {
    [key: string]: string;
  }
}

// This module is quoted, so it shouldn't show up in externs.js.
declare module "DeclareTestQuotedModule" {
  var foo: string;
}

declare var someGlobal: number;

declare interface DeclareTestInterface {
  foo: string;
}

// Should be omitted from externs -- conflicts with Closure.
declare var global: any;
declare interface exports {}
