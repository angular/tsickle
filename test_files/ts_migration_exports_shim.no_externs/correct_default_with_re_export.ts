/**
 * @fileoverview An example export with a re-export to be re-exported via TSMES.
 * @suppress {uselessCode}
 */

export const Foo = 42;

// This re-export under a different name is acceptable to TSMES.
export {Foo as Bar};

goog.tsMigrationDefaultExportsShim('works.with.rexport.of.Bar');
