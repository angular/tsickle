/**
 *
 * @fileoverview Tests template parameters in extends clauses.
 * Generated from: test_files/generic_extends/user.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.generic_extends.user');
var module = module || { id: 'test_files/generic_extends/user.ts' };
goog.require('tslib');
/** @typedef {string} */
var Key;
/**
 * @record
 * @template T
 */
function SomethingGeneric() { }
/* istanbul ignore if */
if (false) {
    /**
     * @type {T}
     * @public
     */
    SomethingGeneric.prototype.key;
}
/**
 * @record
 * @template T
 * @extends {SomethingGeneric}
 */
function SomethingExtendingSomethingGeneric() { }
/* istanbul ignore if */
if (false) {
    /**
     * @type {*}
     * @public
     */
    SomethingExtendingSomethingGeneric.prototype.foo;
}
