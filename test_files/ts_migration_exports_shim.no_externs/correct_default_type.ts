/**
 * @fileoverview An example export to be re-exported.
 * @suppress {uselessCode}
 */

export interface MyDefaultType {
  field: number;
}

goog.tsMigrationExportsShim('project.MyDefaultType', {} as MyDefaultType);
