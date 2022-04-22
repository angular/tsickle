/** An example export to be re-exported. */
export interface MyIntrface {
  field: number;
}

export type MyTypeLiteral = string;

interface MyNotExportedThing {
  aFieldOnMyNotExportedThing: boolean;
}

const notDelete = 'actually delete';
// Test exporting symbol as a reserved keyword.
export {notDelete as delete};

goog.tsMigrationNamedExportsShim('project.CorrectNamedShorthand');
