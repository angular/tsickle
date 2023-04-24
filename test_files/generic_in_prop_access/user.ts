/**
 * @fileoverview Tests template parameters for identifier in property access
 * expression, where TypeScript narrows its type only on usage, i.e. in the
 * return statement below.
 * @suppress {uselessCode}
 */

type Key = 'a'|'b';

interface SomethingGeneric<T extends Key> {
  key: T;
}

function hasThing<T extends Key>(
    groupedThings: {[K in Key]?: Array<SomethingGeneric<K>>;}, key: T,
    thing: SomethingGeneric<T>) {
  const things = groupedThings[key]!;
  return things.indexOf(thing) !== -1;
}
