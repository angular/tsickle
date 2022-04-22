/** An example export to be re-exported. */
export class MyNamedClass {
  field = 1;
}

export interface AnInterface {
  shouldBeANumber: number;
}

export const notDelete = ''

goog.tsMigrationExportsShim('project.named', {
  /* Comments should be ignored. */
  MyRenamedClass: MyNamedClass,
  AnInterfaceRenamed: {} as AnInterface,
  // Test renaming symbol as a reserved keyword.
  delete: notDelete,
});
