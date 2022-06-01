/**
 * @fileoverview An example export to be re-exported.
 * @suppress {uselessCode}
 */

export interface MyDefaultType {
  field: number;
}

goog.tsMigrationDefaultExportsShim('project.CorrectDefaultShorthand');
goog.tsMigrationExportsShimDeclareLegacyNamespace();
