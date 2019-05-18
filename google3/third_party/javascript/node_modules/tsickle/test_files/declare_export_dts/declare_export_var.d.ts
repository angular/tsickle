/**
 * @fileoverview Reproduces a scenario where a .d.ts module defines a local variable, an `export as
 * namespace`, and a global variable, all with the same name. This matches type definitions found in
 * the wild, e.g. for underscore.
 */

declare var variableDeclaredInDtsModule: namespaceInDtsModule.InterfaceNestedInModuleScopedNamespace;
export = variableDeclaredInDtsModule;
// Matches `var variableDeclaredInDtsModule` above, but could be an arbitrary different name.
export as namespace variableDeclaredInDtsModule;

declare global {
  // This matches the `var variableDeclaredInDtsModule` above, but to TypeScript is conceptually a
  // different variable.
  var variableDeclaredInDtsModule: namespaceInDtsModule.InterfaceNestedInModuleScopedNamespace;
}

declare namespace namespaceInDtsModule {
  /**
   * This would commonly be "MyLibraryStatic", i.e. the top level symbols defined for the angular
   * or underscore etc namespace.
   */
  interface InterfaceNestedInModuleScopedNamespace {}
}
