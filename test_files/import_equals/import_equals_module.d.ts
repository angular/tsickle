/**
 * @fileoverview Test import = statements in a module (i.e. non global) context. The particular
 * thing here is to correctly name module contained (mangled) and global (non-mangled) symbols.
 */

import {exportedSymbol} from './exporter';

export = namespaceInModule;

// Make sure a local, mangled alias is emitted and references the mangled name for mynamespace.
import alias = namespaceInModule;

declare namespace namespaceInModule {
  export class InNamespace {}
  // Use alias to refer to the type above.
  export const myVar: alias.InNamespace;
}

declare global {
  namespace globalNamespaceInModule {
    export const globalSymbolInModule: number;
  }
}

// Make sure the local alias is mangled, but the global augmentation isn't.
import globalNamespaceRenamedInModule = globalNamespaceInModule;

// Make sure a global symbol from a different file isn't mangled.
import globalNamespaceFromOtherFileAliasedInModule = React;

// Make sure an imported symbol is mangled to the name at its declaration site (as there is no local
// symbol created for the import in an externs file).
import aliasForImportedSymbol = exportedSymbol;
