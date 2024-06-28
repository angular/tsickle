function toGbigint(val: string): gbigint {
  return val as unknown as gbigint;
}

/** A `gbigint` value on an exported variable. */
export const myGbigint: gbigint = toGbigint('0');

/** A `gbigint` value on a param type. */
export function takeGbigint(val: gbigint): void {
  console.log(val);
}
