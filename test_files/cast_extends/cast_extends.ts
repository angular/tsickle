/**
 * @fileoverview Reproduces an issue where tsickle would emit a cast for the
 * "extends" clause, and Closure would report an error due to the extends
 * expression not resolving to a plain identifier.
 * @suppress {checkTypes,uselessCode}
 */

class Someclass {}

interface MixedIn {
  x: string;
}

export interface Ctor<T = {}> {
  new(...args: Array<{}>): T;
}

export function mix<T extends Someclass>(baseclazz: Ctor<T>): Ctor<T&MixedIn> {
  // "baseclazz" must not be emitted as a cast, but as a direct identifier.
  class WithMixedIn extends(baseclazz as Ctor<Someclass>) implements MixedIn {
    x = 'mixed in';
  }

  return WithMixedIn as Ctor<Someclass>as Ctor<T&MixedIn>;
}
