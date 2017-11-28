/** @fileoverview Make sure imports are inserted *after* the fileoverview. */

import {XY} from './type_alias_exporter';
import ImportedDefaultExport from './type_alias_default_exporter';
import {SOME_CONSTANT} from './export_constant';

// The union types below use members from the exporting files that are not
// explicitly imported into this file. tsickle must emit extra forwardDeclare
// statements for them.

let usingTypeAlias: XY;
let usingTypeAliasInUnion: XY|boolean;
let usingDefaultExportAlias: ImportedDefaultExport|boolean;

// The code below reproduces an issue where tsickle would break source maps if it just post-hoc
// prepended imports to its emit, which in turn would break the references to imported symbols, as
// tsc would no longer understand these symbols are imported and need to be prefixed with the module
// type.

console.log(SOME_CONSTANT);
