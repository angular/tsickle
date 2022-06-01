/**
 *
 * @fileoverview Tests that tuple types get emitted with local aliases to
 * attach Closure types to.
 *
 * Generated from: test_files/tuple_types/tuple_types.ts
 */
goog.module('test_files.tuple_types.tuple_types');
var module = module || { id: 'test_files/tuple_types/tuple_types.ts' };
goog.require('tslib');
/** @type {!Map<string, number>} */
const m = new Map([['1', 1], ['2', 2]]);
for (const [s__tsickle_destructured_1, n__tsickle_destructured_2] of m) {
    const s = /** @type {string} */ (s__tsickle_destructured_1);
    const n = /** @type {number} */ (n__tsickle_destructured_2);
    console.error(s, n);
}
/**
 * @param {!Array<?>} xs
 * @return {void}
 */
function localTuple(xs) {
    const [s__tsickle_destructured_3, [n1__tsickle_destructured_4, n2__tsickle_destructured_5]] = xs;
    const s = /** @type {string} */ (s__tsickle_destructured_3);
    const n1 = /** @type {number} */ (n1__tsickle_destructured_4);
    const n2 = /** @type {number} */ (n2__tsickle_destructured_5);
    console.error(s, n1, n2);
    const [, [, elision__tsickle_destructured_6]] = xs;
    const elision = /** @type {number} */ (elision__tsickle_destructured_6);
    console.error(elision);
}
/**
 * @param {!Array<?>} xs
 * @return {void}
 */
function unsupportedObjectDestructuring(xs) {
    const [s, { a }] = xs;
    console.error(s, a);
    const { destructured3, destructured4 } = { destructured3: 3, destructured4: 4 };
    console.error(destructured3, destructured4);
}
/**
 * @param {!Array<?>} xs
 * @return {void}
 */
function letDestructuring(xs) {
    let [a__tsickle_destructured_8, b__tsickle_destructured_9] = xs;
    let a = /** @type {string} */ (a__tsickle_destructured_8);
    let b = /** @type {number} */ (b__tsickle_destructured_9);
    a = 'changed';
    console.error(a, b);
}
/** @type {!Array<?>} */
const tupleTyped = [1, 'a'];
/** @type {!Array<?>} */
const tupleTypedHomogeneous = [1, 1];
/** @type {!Array<?>} */
const emptyTupleType = [];
console.error(tupleTyped, tupleTypedHomogeneous, emptyTupleType);
