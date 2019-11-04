// test_files/invalid_closure_properties/invalid_closure_properties.ts(18,12): warning TS0: omitting inexpressible property name: __@observable
// test_files/invalid_closure_properties/invalid_closure_properties.ts(18,12): warning TS0: omitting inexpressible property name: with spaces
/**
 *
 * @fileoverview Check the type generated when using a builtin symbol as
 * a computed property.
 *
 * Generated from: test_files/invalid_closure_properties/invalid_closure_properties.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
// This test is verifying the type of this expression, which ultimately
// refers to some TypeScript internal __@observeable thing.  Note that
// Symbol.observable here refers to the above SymbolConstructor observable.
goog.module('test_files.invalid_closure_properties.invalid_closure_properties');
var module = module || { id: 'test_files/invalid_closure_properties/invalid_closure_properties.ts' };
module = module;
/** @type {(null|{otherField: string})} */
exports.x = null;
