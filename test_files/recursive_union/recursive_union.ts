/**
 * @fileoverview Reproduces a reported crash in tsickle with recursive union
 * types.
 */

/** Recursive union type representing valid JSON values. */
export type JsonValue =
    JsonValue[]|boolean|null|number|string|{[property: string]: JsonValue};

/** A value using the type. */
export const validJson: JsonValue = {
  a: 'b',
  c: {d: 'f', g: 8}
};
