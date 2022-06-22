// test_files/declare_import/declare_import_in_ts.ts(19,1): warning TS0: dropped extends: {?} type
// test_files/declare_import/declare_import_in_ts.ts(20,1): warning TS0: dropped extends: {?} type
// test_files/declare_import/declare_import_in_ts.ts(21,1): warning TS0: dropped extends: {?} type
// test_files/declare_import/declare_import_in_ts.ts(22,1): warning TS0: dropped extends: {?} type
// test_files/declare_import/declare_import_in_ts.ts(25,1): warning TS0: dropped extends: {?} type
/**
 *
 * @fileoverview Tests that imports in .ts resolve to the correct result names. See externs.ts
 * addImportAliases.
 *
 * The code below tests mixing symbols from .d.ts and .ts files, to make sure type references are
 * uniformly generated.
 *
 * Generated from: test_files/declare_import/declare_import_in_ts.ts
 */
goog.module('test_files.declare_import.declare_import_in_ts');
var module = module || { id: 'test_files/declare_import/declare_import_in_ts.ts' };
goog.require('tslib');
const tsickle_Class_1 = goog.requireType("imported.closure.default.Class");
const tsickle_named_2 = goog.requireType("imported.closure.named");
const tsickle_export_default_3 = goog.requireType("test_files.declare_import.export_default");
const tsickle_exporter_4 = goog.requireType("test_files.declare_import.exporter");
const tsickle_exporting_5 = goog.requireType("test_files.declare_import.exporting");
const goog_imported_closure_default_Class_1 = goog.require('imported.closure.default.Class');
const goog_imported_closure_named_1 = goog.require('imported.closure.named');
const export_default_1 = goog.require('test_files.declare_import.export_default');
const prefix = goog.require('test_files.declare_import.exporter');
const exporter_1 = prefix;
const exporter_2 = prefix;
const importEquals = prefix;
