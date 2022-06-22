/**
 *
 * @fileoverview Tests that initialized variables that end up untyped (`?`) do not get an explicit
 * type annotation, so that Closure's type inference can kick in and possibly do a better job.
 *
 * Generated from: test_files/jsdoc_types/initialized_unknown.ts
 */
// This should not have a type annotation.
goog.module('test_files.jsdoc_types.initialized_unknown');
var module = module || { id: 'test_files/jsdoc_types/initialized_unknown.ts' };
goog.require('tslib');
const initializedUntyped = {
    foo: 1
};
// This should have a type annotation as the variable is not initialized.
// tslint:disable-next-line:prefer-const
/** @type {?} */
let uninitializedUntyped;
