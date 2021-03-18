/** An example export to be re-exported. */
export class MyDefaultClass {
  field = 1;
}

goog.tsMigrationExportsShim('project.MyDefaultClass', MyDefaultClass);
