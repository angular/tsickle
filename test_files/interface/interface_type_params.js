/**
 *
 * @fileoverview
 * Generated from: test_files/interface/interface_type_params.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.interface.interface_type_params');
var module = module || { id: 'test_files/interface/interface_type_params.ts' };
goog.require('tslib');
/**
 * @record
 */
function UpperBound() { }
/* istanbul ignore if */
if (false) {
    /**
     * @type {number}
     * @public
     */
    UpperBound.prototype.x;
}
/**
 * @record
 * @template T, U
 */
function WithTypeParam() { }
/* istanbul ignore if */
if (false) {
    /**
     * @type {T}
     * @public
     */
    WithTypeParam.prototype.tea;
    /**
     * @type {U}
     * @public
     */
    WithTypeParam.prototype.you;
}
