/** An example export to be re-exported. */
export class MyNamedClass {
  field = 1;
}

goog.tsMigrationExportsShim('project.named', {MyRenamedClass: MyNamedClass});
