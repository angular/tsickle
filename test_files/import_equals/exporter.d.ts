export declare namespace exportedSymbol {
  export const valueInNamespace: number;
}

// Just "export", not "declare". It will still generate externs because Tsickle
// generates externs for everything in a .d.ts file.
export class Exported {}

export namespace Exported {
  export class Nested {}
}

export namespace Exported.Nested {
  export enum Thing {
    ITEM = 1,
  }
}
