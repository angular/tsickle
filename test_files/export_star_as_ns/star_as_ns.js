/**
 *
 * @fileoverview Tests exporting a namespace with a given name from Closure. This doesn't expand
 * each export like the `export * from '...'` syntax, so it's output just an assignment of the
 * imported module to a property on `exports`.
 *
 * Generated from: test_files/export_star_as_ns/star_as_ns.ts
 */
goog.module('test_files.export_star_as_ns.star_as_ns');
var module = module || { id: 'test_files/export_star_as_ns/star_as_ns.ts' };
goog.require('tslib');
const tsickle_ns_1 = goog.requireType("test_files.export_star_as_ns.ns");
const tsickle_module_1_ = goog.require('test_files.export_star_as_ns.ns');
/** @const */
exports.ns = tsickle_module_1_;
