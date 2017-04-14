goog.module('test_files.interface.interface_type_params');var module = module || {id: 'test_files/interface/interface_type_params.js'};/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes}
 */
/**
 * @record
 */
function UpperBound() { }
/** @type {number} */
UpperBound.prototype.x;
// unsupported: template constraints.
/**
 * @record
 * @template T, U
 */
function WithTypeParam() { }
/** @type {T} */
WithTypeParam.prototype.tea;
/** @type {U} */
WithTypeParam.prototype.you;
