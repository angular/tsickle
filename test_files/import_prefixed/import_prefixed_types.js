/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
goog.module('test_files.import_prefixed.import_prefixed_types');var module = module || {id: 'test_files/import_prefixed/import_prefixed_types.js'};// This file imports exporter with a prefix import (* as ...), and then only
// uses the import in a type position.
// tsickle emits a goog.forwardDeclare for the type and uses it to refer to the
// type TypeExport.

const tsickle_forward_declare_1 = goog.forwardDeclare("test_files.import_prefixed.exporter");
const /** @type {tsickle_forward_declare_1.TypeExport} */ someVar = 1;
console.log(someVar);
