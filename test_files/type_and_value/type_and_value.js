goog.module('test_files.type_and_value.type_and_value');var module = module || {id: 'test_files/type_and_value/type_and_value.js'};/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes}
 */

var conflict = goog.require('test_files.type_and_value.module');
// This test deals with symbols that are simultaneously types and values.
// Use a browser built-in as both a type and a value.
let /** @type {function(new: (!Document)): ?} */ useBuiltInAsValue = Document;
let /** @type {!Document} */ useBuiltInAsType;
// Use a user-defined class as both a type and a value.
let /** @type {?} */ useUserClassAsValue = conflict.Class;
let /** @type {!conflict.Class} */ useUserClassAsType;
// Use a user-defined interface/value pair as both a type and a value.
let /** @type {number} */ useAsValue = conflict.TypeAndValue;
// Note: because of the conflict, we currently just use the type {?} here.
let /** @type {?} */ useAsType;
