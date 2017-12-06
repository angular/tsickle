// const enum values are inlined, so even though const enums are values,
// TypeScript might not generate any imports for them, which means modules
// containing only types and const enums must be "force loaded".

export const enum ConstEnum {
  BAR,
  BAZ
}

export interface SomeInterface {}
