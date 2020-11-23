export declare interface InterfaceUsedByReexportedInDts {
    property: string
}

interface InternalInterface {
    nestedInterface: InterfaceUsedByReexportedInDts;
}

export const reexportedInDts: InternalInterface;
