/**
 *
 * @fileoverview Tests that destructured parameters get aliased into more
 * specific local variables.
 * Generated from: test_files/tuple_types/tuple_functions.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.tuple_types.tuple_functions');
var module = module || { id: 'test_files/tuple_types/tuple_functions.ts' };
goog.require('tslib');
class Clazz {
    /**
     * @public
     * @param {!Array<?>} __0
     */
    constructor([a__tsickle_destructured_1, b__tsickle_destructured_2]) {
        this.field = '';
        let a = /** @type {string} */ (a__tsickle_destructured_1);
        let b = /** @type {number} */ (b__tsickle_destructured_2);
        this.field = a + b;
    }
    /**
     * @public
     * @param {!Array<?>} __0
     * @return {string}
     */
    destructuringMethod([a__tsickle_destructured_3, b__tsickle_destructured_4]) {
        let a = /** @type {string} */ (a__tsickle_destructured_3);
        let b = /** @type {number} */ (b__tsickle_destructured_4);
        return a + b;
    }
    /**
     * @public
     * @param {!Array<?>} __0
     * @return {void}
     */
    set destructuringSetter([a__tsickle_destructured_5, b__tsickle_destructured_6]) {
        let a = /** @type {string} */ (a__tsickle_destructured_5);
        let b = /** @type {number} */ (b__tsickle_destructured_6);
        this.field = a + b;
    }
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {string}
     * @public
     */
    Clazz.prototype.field;
}
/**
 * @abstract
 */
class AbstractClazz {
}
/* istanbul ignore if */
if (false) {
    /**
     * @abstract
     * @public
     * @param {!Array<?>} __0
     * @return {string}
     */
    AbstractClazz.prototype.abstractDestructuringMethod = function (__0) { };
}
/**
 * @param {!Array<?>} __0
 * @return {string}
 */
function destructuringFunctionDeclaration([a__tsickle_destructured_7, b__tsickle_destructured_8]) {
    let a = /** @type {string} */ (a__tsickle_destructured_7);
    let b = /** @type {number} */ (b__tsickle_destructured_8);
    return a + b;
}
/** @type {function(!Array<?>): string} */
const destructuringFunctionExpression = (/**
 * @param {!Array<?>} __0
 * @return {string}
 */
function ([a__tsickle_destructured_9, b__tsickle_destructured_10]) {
    let a = /** @type {string} */ (a__tsickle_destructured_9);
    let b = /** @type {number} */ (b__tsickle_destructured_10);
    return a + b;
});
/** @type {function(!Array<?>): string} */
const destructuringArrow = (/**
 * @param {!Array<?>} __0
 * @return {string}
 */
([a__tsickle_destructured_11, b__tsickle_destructured_12]) => {
    let a = /** @type {string} */ (a__tsickle_destructured_11);
    let b = /** @type {number} */ (b__tsickle_destructured_12);
    return a + b;
});
/** @type {function(!Array<?>): string} */
const destructuringArrowComment = (/**
 * @param {!Array<?>} __0
 * @return {string}
 */
([a__tsickle_destructured_13, b__tsickle_destructured_14]) => {
    let a = /** @type {string} */ (a__tsickle_destructured_13);
    let b = /** @type {number} */ (b__tsickle_destructured_14);
    return (
    // with a comment
    a + b);
});
