import { OwnInterface, InterfaceUsedByReexportedInDts, reexportedInDts, rexportedFromNonDts } from './declare_export_star';

const a: OwnInterface = {};
const b: InterfaceUsedByReexportedInDts = { property: '' };

// Tests that types are resolved to namespace on which they were initially defined.
function usesReexportedNameAsParamType(param: InterfaceUsedByReexportedInDts): InterfaceUsedByReexportedInDts {
    return { property: '' };
}

// Tests that typesin heritage clauses are resolved to namespace on which they were initially defined.
class AClass implements InterfaceUsedByReexportedInDts {
    get property(): string { return ''; }
}

// These names will be accessed on declare_export_star in transpiled js.
reexportedInDts;
rexportedFromNonDts;
