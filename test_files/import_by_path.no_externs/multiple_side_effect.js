/**
 *
 * @fileoverview Imports a module with conflicting provides, but with a
 * side-effect import. tsickle only reports an error when code imports a symbol
 * from a module with conflicting symbol exports, but not for a side effect
 * import.
 * Generated from: test_files/import_by_path.no_externs/multiple_side_effect.ts
 * @suppress {checkTypes}
 *
 */
goog.module('test_files.import_by_path.no_externs.multiple_side_effect');
var module = module || { id: 'test_files/import_by_path.no_externs/multiple_side_effect.ts' };
goog.require('tslib');
// This import produces a require for any of the provides defined in the given
// file. This has the intended effect: the file will be required and thus
// loaded. It does not matter which provide is required.
goog.require('multiple.provides.conflicting.a');
