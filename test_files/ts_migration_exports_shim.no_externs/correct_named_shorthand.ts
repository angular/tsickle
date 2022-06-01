/**
 * @fileoverview An example export to be re-exported.
 * @suppress {uselessCode}
 */

export interface MyIntrface {
  field: number;
}

export type MyTypeLiteral = string;

interface MyNotExportedThing {
  aFieldOnMyNotExportedThing: boolean;
}

goog.tsMigrationNamedExportsShim('project.CorrectNamedShorthand');
