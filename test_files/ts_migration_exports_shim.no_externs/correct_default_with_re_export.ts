/**
 * @fileoverview An example export with a re-export to be re-exported via TSMES.
 * @suppress {uselessCode}
 */

class Foo {}

export {Foo as Bar};

goog.tsMigrationDefaultExportsShim('works.with.rexport.of.Bar');
