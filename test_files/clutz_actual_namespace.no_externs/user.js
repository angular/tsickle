/**
 *
 * @fileoverview A user of the custom module.
 *
 * We expect the the output .js to to the module import via a
 * 'custom.module.name' goog.require.
 *
 * Generated from: test_files/clutz_actual_namespace.no_externs/user.ts
 * @suppress {checkTypes,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.clutz_actual_namespace.no_externs.user');
var module = module || { id: 'test_files/clutz_actual_namespace.no_externs/user.ts' };
goog.require('tslib');
const tsickle_module_1 = goog.requireType("custom.module.name");
const module_1 = goog.require('custom.module.name');
console.log(module_1.foo);
