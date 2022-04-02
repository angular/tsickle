export * from './reexport_ambient';
export * from './reexport_empty';
export * from './reexport_nonambient';

import { namedExportBehindSeveralExportStars } from './3_reexport_nested';

// Tests that types are resolved to the namespace on which they were initially defined.
// The logic for externs is different from that of normal `.ts`, so a separate test is made.
export function usesNamedExportFollowedByReexportsAsParamType(param: namedExportBehindSeveralExportStars):void

// Tests that types in heritage clauses are resolved to the namespace on which they were actually defined.
export class AClass implements namedExportBehindSeveralExportStars {
    prop1: string
    prop2: number
}

export interface OwnInterface { }
