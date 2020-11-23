export * from './reexport_ambient';
export * from './reexport_empty';
export * from './reexport_nonambient';

import { namedExportBehindSeveralExportStars } from './3_reexport_nested';

// Tests that types are resolved to namespace on which they were initially defined.
// The logic for externs is different from that of normal `.ts`, so a separate test is made.
export function usesNamedExportFollowedByReexportsAsParamType(param: namedExportBehindSeveralExportStars):void

export interface OwnInterface { }
