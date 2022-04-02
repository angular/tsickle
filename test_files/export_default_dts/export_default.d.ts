/**
 * @fileoverview Tests that default exports from .d.ts are defined on the root namespace with
 * "default" property. Expressions in default export in d.ts are limited to identifiers and
 * qualified names, and we test here that qualified name works.
 */
declare namespace innerNamespace {
    class DefaultExportedClass{
        property:string
    }
}

export default innerNamespace.DefaultExportedClass;
