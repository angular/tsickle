interface NoProperties {}

interface BasicProperties {
  cat: 'abyssinian'|'tabby'|'ragdoll';
  count: number;
}

interface BagProperties {
  [k: string]: boolean;
}

enum FancyEnum {
  RED = 1,
}

const fancySymbol = Symbol();

interface FancyProperties {
  nested: BasicProperties;
  [fancySymbol]: BagProperties;
  [FancyEnum.RED]: boolean;
  [Symbol.iterator](): Iterable<string>;
  new(): FancyProperties;
  (): void;
}

type MappedNo = {
  [K in keyof NoProperties]: boolean
};
type MappedBasic = {
  [K in keyof BasicProperties]: boolean
};
type MappedBag = {
  [K in keyof BagProperties]: boolean
};
type MappedFancy = {
  [K in keyof FancyProperties]: (a: number) => string
};

type PartialNo = Partial<NoProperties>;
type PartialBasic = Partial<BasicProperties>;
type PartialBag = Partial<BagProperties>;
type PartialFancy = Partial<FancyProperties>;

// We don't express the properties as @const :(
type NotProperlyHandledReadonly = Readonly<BasicProperties>;

enum Locale {
  EN_US = 'en-us',
}
// The typedef for this would be like {{en-us: string}} which is invalid, so
// this is not expressible.
type InexpressibleType = {[locale in Locale]: string}
