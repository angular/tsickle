/**
 *
 * @fileoverview Reproduces a problem where a renamed Clutz default export ({default as X}) would
 * produce type annotations including an indirection to the aliased symbol.
 *
 * Generated from: test_files/clutz.no_externs/import_default.ts
 */
goog.module('test_files.clutz.no_externs.import_default');
var module = module || { id: 'test_files/clutz.no_externs/import_default.ts' };
goog.require('tslib');
const tsickle_goog_default_export_1 = goog.requireType("default_export");
/** @type {(null|!tsickle_goog_default_export_1)} */
const usingType = null;
// The symbol below was previously named as tsickle_default_export_1.AliasedDefaultExport. It must
// be emitted as just tsickle_default_export_1.
/** @type {(null|!tsickle_goog_default_export_1)} */
const usingType2 = null;
