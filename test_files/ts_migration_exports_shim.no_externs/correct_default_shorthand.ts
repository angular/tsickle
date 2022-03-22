/** An example export to be re-exported. */
export interface MyDefaultType {
  field: number;
}

goog.tsMigrationDefaultExportsShim('project.CorrectDefaultShorthand');
goog.tsMigrationExportsShimDeclareLegacyNamespace();
