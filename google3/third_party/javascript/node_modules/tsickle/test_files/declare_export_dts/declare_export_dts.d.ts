/**
 * @fileoverview Tests several scenarios for a .d.ts file that exports types. See externs.js for
 * the expected results, and user.ts for code using it.
 */

export declare interface InterfaceExportedInDts {
  nestedInterface: InterfaceUsedByExportedInDts;
  namespaceNestedInterface: nestedNamespace.InterfaceNestedInNamespace;
  globalInterface: GlobalInterfaceDeclaredInExternalDts;
}

export declare interface InterfaceUsedByExportedInDts {
  property: string;
}

export declare namespace nestedNamespace {
  export interface InterfaceNestedInNamespace {}
}

declare global {
  export interface GlobalInterfaceDeclaredInExternalDts {}
}

declare module 'ambient_external_module' {
  export interface InterfaceDeclaredInAmbientExternalModule {}
  export const user: InterfaceDeclaredInAmbientExternalModule;
}

// This path gets resolved, but ends up as 'relative_ambient_external_module' because no such module
// exists.
declare module './relative_ambient_external_module' {
  export interface InterfaceDeclaredInRelativeAmbientExternalModule {}
  export const user: InterfaceDeclaredInRelativeAmbientExternalModule;
}
