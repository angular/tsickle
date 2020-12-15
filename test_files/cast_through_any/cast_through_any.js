/**
 *
 * @fileoverview Tests that casts through `any` and `unknown` to another type
 * drop the inner cast in the Closure JavaScript output:
 *
 * This example code:
 *
 *     const x = a as any as B;
 *
 * should become (escaped for comments):
 *
 *     (\/** \@type {!B} *\/ (a));
 *
 * Generated from: test_files/cast_through_any/cast_through_any.ts
 * @suppress {checkTypes,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.cast_through_any.cast_through_any');
var module = module || { id: 'test_files/cast_through_any/cast_through_any.ts' };
goog.require('tslib');
/**
 * @record
 */
function A() { }
/* istanbul ignore if */
if (false) {
    /** @type {boolean} */
    A.prototype.prop;
}
/**
 * @record
 */
function B() { }
/* istanbul ignore if */
if (false) {
    /** @type {number} */
    B.prototype.prop;
}
/** @type {!A} */
const a = {
    prop: true
};
/** @typedef {?} */
var AnyDuringFakeMigration;
// The `any` should be dropped in Closure JavaScript output and cast `a` to `B`
// directly.
// tslint:disable-next-line:no-any
/** @type {!B} */
const throughAny = (/** @type {!B} */ (a));
// An alias to `any` should have the same behavior as above.
// tslint:disable-next-line:ban-types
/** @type {!B} */
const throughAnyDuringMigration = (/** @type {!B} */ (a));
// `unknown` should have the same behavior as `any` and `a` should be cast to
// `B` directly.
/** @type {!B} */
const throughUnknown = (/** @type {!B} */ (a));
// Casting through `{}` should retain the cast in JavaScript output.
/** @type {!B} */
const throughEmptyObjNotBackedOff = (/** @type {!B} */ ((/** @type {*} */ (a))));
// Casting through a non-empty type should behave the same as above.
/** @type {!B} */
const throughTypeNotBackedOff = (/** @type {!B} */ ((/** @type {{prop: (number|boolean)}} */ (a))));
// Test that assignment to a property after this cast still works.
((/** @type {!ElementCSSInlineStyle} */ (a))).style.display = 'none';
