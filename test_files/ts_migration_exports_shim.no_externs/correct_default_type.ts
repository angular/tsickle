/** An example export to be re-exported. */
export interface MyDefaultType {
  field: number;
}

goog.tsMigrationExportsShim('project.MyDefaultType', {} as MyDefaultType);
