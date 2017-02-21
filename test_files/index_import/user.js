/** @fileoverview @suppress {lateProvide} */ goog.module('test_files.index_import.user');var module = module || {id: 'test_files/index_import/user.js'};
/// <ref './library.d.ts'>
var index_1 = goog.require('test_files.index_import.has_index.index');
const a = index_1.a; /* local alias for Closure JSDoc */
var index_2 = index_1;
exports.a = index_2.a;
var index_3 = index_1;
exports.a = index_3.a;
var index_4 = index_1;
const a2 = index_4.a; /* local alias for Closure JSDoc */
var index_js_1 = index_1;
const a3 = index_js_1.a; /* local alias for Closure JSDoc */
var lib_1 = goog.require('test_files.index_import.lib');
const b = lib_1.b; /* local alias for Closure JSDoc */
