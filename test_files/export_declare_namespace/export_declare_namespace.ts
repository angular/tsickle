export declare namespace exportedDeclaredNamespace {
  export interface Used {}
  export interface User {
    fieldFromLocalNamespace: Used;
    fieldFromOtherNamespace: nested.exportedNamespace.Used;
  }
}

export declare namespace nested.exportedNamespace {
  export interface Used {}
  export interface User {
    fieldFromLocalNamespace: Used;
    fieldFromOtherNamespace: exportedDeclaredNamespace.Used;
  }
}

declare global {
  namespace globalNamespace {
    export class ClassInGlobal {
      field: nested.exportedNamespace.Used;
    }
  }
}

export declare namespace exportedNamespaceUsingGlobal {
  export interface User {
    field: globalNamespace.ClassInGlobal;
  }
}

export class ModuleType {}

export declare namespace exportedNamespaceUsingModuleType {
  export interface User {
    /**
     * This field should be emitted untyped as it references a type that's local to this module.
     */
    field: ModuleType;
  }
}
