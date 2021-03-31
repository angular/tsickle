/**
 * @fileoverview Tests an interaction between conditional types and rest (...)
 * types.
 */

function conditionalRestTupleType<T>(...args: T extends string ? [] : ['a']) {}

export const x = {
  conditionalRestTupleType<T>(...args: T extends string ? [] : ['a']) {
    conditionalRestTupleType<T>(...args);
  }
};
