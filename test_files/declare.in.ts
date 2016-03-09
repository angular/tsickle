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
