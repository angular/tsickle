/** @fileoverview See renamed_export_type.ts. */

// Name intentionally collides with the type exported from ./declaration.
export interface SomeInterface {
  field: number;
}
export {SomeInterface as RenamedExport} from './declaration';
