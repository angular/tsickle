/**
 * @fileoverview Regression test to ensure local type symbols can be exported.
 * @suppress {uselessCode}
 */

interface LocalInterface {
  field: string;
}

export {LocalInterface, LocalInterface as AliasedName};
