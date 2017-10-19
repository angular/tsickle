export function identity<T, U>(arg: T): U {
  return arg as any;
}

export interface HasThing<T> {
  thing: T;
}

export interface Lengthwise {
  length: number;
}

export function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

export class GenericNumber<T> {
  zeroValue: T;
  add: (x: T, y: T) => T;
}

export class LengthwiseContainer<T extends Lengthwise> {
  constructor(private t: T) {}
  incrementLength() {
    return this.t.length + 1;
  }
}

export class DefaultGeneric<T extends {} = {}> {}