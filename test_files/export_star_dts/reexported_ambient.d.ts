interface InterfaceReexportedInDts {
    nestedInterface: InterfaceUsedByReexportedInDts;
}

export const variableReexportedInDts:InterfaceUsedByReexportedInDts;

export declare interface InterfaceUsedByReexportedInDts {
    property: string
}
