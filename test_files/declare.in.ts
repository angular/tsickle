declare module DeclareTestModule {
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

declare var someGlobal: number;

declare interface DeclareTestInterface {
  foo: string;
}

// Should be omitted from externs -- conflicts with Closure.
declare var global: any;
declare interface exports {}
