// test_files/generic_in_prop_access/user.ts(14,1): warning TS0: unhandled type {type flags:0x80000 Object objectFlags:0x20 object:Mapped}
// test_files/generic_in_prop_access/user.ts(17,9): warning TS0: unhandled type flags: IncludesWildcard
// test_files/generic_in_prop_access/user.ts(17,18): warning TS0: unhandled type flags: IncludesWildcard
/**
 *
 * @fileoverview Tests template parameters for identifier in property access
 * expression, where TypeScript narrows its type only on usage, i.e. in the
 * return statement below.
 * Generated from: test_files/generic_in_prop_access/user.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.generic_in_prop_access.user');
var module = module || { id: 'test_files/generic_in_prop_access/user.ts' };
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
 * @template T
 * @param {?} groupedThings
 * @param {T} key
 * @param {!SomethingGeneric<T>} thing
 * @return {boolean}
 */
function hasThing(groupedThings, key, thing) {
    /** @type {?} */
    const things = (/** @type {?} */ (groupedThings[key]));
    return (/** @type {!Array<!SomethingGeneric<T>>} */ (things)).indexOf(thing) !== -1;
}
