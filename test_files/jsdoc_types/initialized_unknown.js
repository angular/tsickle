/**
 *
 * @fileoverview Tests that initialized variables that end up untyped (`?`) do not get an explicit
 * type annotation, so that Closure's type inference can kick in and possibly do a better job.
 *
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
goog.module('test_files.jsdoc_types.initialized_unknown');
var module = module || { id: 'test_files/jsdoc_types/initialized_unknown.ts' };
module = module;
exports = {};
const tsickle_forward_declare_1 = goog.forwardDeclare("test_files.jsdoc_types.nevertyped");
goog.require('test_files.jsdoc_types.nevertyped'); // force type-only module to be loaded
// This should not have a type annotation.
const initializedUntyped = {
    foo: 1
};
// This should have a type annotation as the variable is not initialized.
// tslint:disable-next-line:prefer-const
/** @type {?} */
let uninitializedUntyped;
