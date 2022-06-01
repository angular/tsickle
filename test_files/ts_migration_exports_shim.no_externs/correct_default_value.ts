/**
 * @fileoverview An example export to be re-exported.
 * @suppress {uselessCode}
 */

export class MyDefaultClass {
  field = 1;
}

goog.tsMigrationExportsShim('project.MyDefaultClass', MyDefaultClass);
