/** An example export to be re-exported. */
export interface MyIntrface {
  field: number;
}

export type MyTypeLiteral = string;

interface MyNotExportedThing {
  aFieldOnMyNotExportedThing: boolean;
}

goog.tsMigrationNamedExportsShim('project.CorrectNamedShorthand');
