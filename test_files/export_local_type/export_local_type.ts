/** @fileoverview Regression test to ensure local type symbols can be exported. */

interface LocalInterface {
  field: string;
}

export {LocalInterface, LocalInterface as AliasedName};
