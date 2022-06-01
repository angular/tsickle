/**
 * @fileoverview An example export to be re-exported.
 * @suppress {uselessCode}
 */

export class MyNamedClass {
  field = 1;
}

export interface AnInterface {
  shouldBeANumber: number;
}

goog.tsMigrationExportsShim('project.named', {
  MyRenamedClass: MyNamedClass,
  AnInterfaceRenamed: {} as AnInterface,
});
