declare interface Getter {
  get propertyA(): string;
}

declare interface Setter {
  set propertyB(value: number);
}

declare interface GetterAndSetter {
  get propertyC(): bigint;
  set propertyC(value: bigint);
}

declare interface MismatchedTypes {
  // Should always choose the getter return type for the property.
  get propertyD(): boolean;
  set propertyD(value: boolean|string|undefined);
}

declare interface DifferentOrder {
  // Should choose the getter regardless of the definition order.
  set propertyE(value: boolean|string|undefined);
  get propertyE(): boolean;
}

// Re-opening a type to add the pair for an accessor will work, but will output
// the property twice. Still, both property declarations should have the same
// type.
declare interface Reopen {
  set propertyF(value: string|boolean|number);
}

declare interface Reopen {
  get propertyF(): string|boolean;
}

declare class Static {
  static get staticProperty(): string;
  static set staticProperty(value: string);

  get instanceProperty(): string;
  set instanceProperty(value: string);
}
