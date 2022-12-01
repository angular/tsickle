/**
 *
 * @fileoverview Test that type casts are emitted when a type is used which was
 * narrowed since declaration.
 * Generated from: test_files/type_narrowing/emit_extra_casts.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.type_narrowing.emit_extra_casts');
var module = module || { id: 'test_files/type_narrowing/emit_extra_casts.ts' };
goog.require('tslib');
/**
 * @record
 */
function Foo() { }
/**
 * @record
 * @extends {Foo}
 */
function HasX() { }
/* istanbul ignore if */
if (false) {
    /**
     * @type {number}
     * @public
     */
    HasX.prototype.x;
}
/**
 * @param {!Foo} p
 * @return {boolean}
 */
function hasX(p) {
    return ((/** @type {!HasX} */ (p))).x !== undefined;
}
/**
 * @param {!Foo} p
 * @return {number}
 */
function getX(p) {
    if (!hasX(p))
        return 0;
    // Expect a cast.
    return (/** @type {!HasX} */ (p)).x;
}
/**
 * @param {!Foo} p
 * @return {number}
 */
function getXUnsafe(p) {
    /** @type {!HasX} */
    const casted = (/** @type {!HasX} */ (p));
    // Expect no casts.
    return casted.x;
}
/**
 * @record
 * @extends {Foo}
 */
function HasY() { }
/* istanbul ignore if */
if (false) {
    /**
     * @type {(string|number)}
     * @public
     */
    HasY.prototype.y;
}
/**
 * @param {!Foo} p
 * @return {boolean}
 */
function hasY(p) {
    return ((/** @type {!HasY} */ (p))).y !== undefined;
}
/**
 * @param {!Foo} p
 * @return {(string|number)}
 */
function getY(p) {
    if (!hasY(p))
        return 0;
    // Expect a cast.
    return (/** @type {!HasY} */ (p)).y;
}
/**
 * @param {!Foo} p
 * @return {number}
 */
function getYAsNumber(p) {
    if (!hasY(p))
        return 0;
    if (typeof (/** @type {!HasY} */ (p)).y === 'string')
        return 0;
    // Expect 2 casts.
    return (/** @type {number} */ ((/** @type {!HasY} */ (p)).y));
}
/**
 * @param {!HasY} p
 * @return {number}
 */
function getYAsNumberCheckPropertyOnly(p) {
    if (typeof p.y === 'string')
        return 0;
    // Expect no casts.
    return p.y;
}
/**
 * @record
 */
function Fish() { }
/* istanbul ignore if */
if (false) {
    /**
     * @public
     * @return {void}
     */
    Fish.prototype.swim = function () { };
}
/**
 * @record
 */
function Bird() { }
/* istanbul ignore if */
if (false) {
    /**
     * @public
     * @return {void}
     */
    Bird.prototype.fly = function () { };
}
/**
 * @param {(undefined|!Fish|!Bird)} pet
 * @return {boolean}
 */
function isFish(pet) {
    return ((/** @type {!Fish} */ (pet))).swim !== undefined;
}
/**
 * @param {(!Fish|!Bird)} pet
 * @return {void}
 */
function doAnimalAction(pet) {
    if (isFish(pet)) {
        // Expect a cast.
        (/** @type {!Fish} */ (pet)).swim();
    }
    else {
        // Expect a cast.
        (/** @type {!Bird} */ (pet)).fly();
    }
}
/**
 * @param {(undefined|!Fish|!Bird)} pet
 * @return {void}
 */
function maybeDoAnimalAction(pet) {
    if (isFish(pet)) {
        // Expect a cast.
        (/** @type {!Fish} */ (pet)).swim();
    }
    else {
        // Expect no casts.
        pet === null || pet === void 0 ? void 0 : pet.fly();
    }
}
