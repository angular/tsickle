// test_files/type/type.ts(25,5): warning TS0: unhandled anonymous type
/**
 * @fileoverview added by tsickle
 * Generated from: test_files/type/type.ts
 */
goog.module('test_files.type.type');
var module = module || { id: 'test_files/type/type.ts' };
goog.require('tslib');
/** @type {?} */
let typeAny;
/** @type {!Array<?>} */
let typeArr;
/** @type {!Array<?>} */
let typeArr2;
/** @type {!Array<!Array<{a: ?}>>} */
let typeNestedArr;
/** @type {*} */
let typeUnknown;
/** @type {bigint} */
let typeBigInt;
/** @type {boolean} */
let typeBooleanLiteral;
/** @type {number} */
let typeNumberLiteral;
/** @type {string} */
let typeStringLiteral;
/** @type {bigint} */
let typeBigIntLiteral;
/** @type {{a: number, b: string}} */
let typeObject = { a: 3, b: 'b' };
/** @type {!Object<string,number>} */
let typeObjectIndexable;
/** @type {?} */
let typeObjectMixedIndexProperty;
/** @type {*} */
let typeObjectEmpty;
/** @type {!Object} */
let typeNonPrimitive;
// Verify assignability into these supertypes.
typeObjectEmpty = 1;
typeObjectEmpty = 'a';
typeObjectEmpty = new Date();
typeObjectEmpty = {};
typeNonPrimitive = {};
typeNonPrimitive = new Date();
/** @type {!Array<?>} */
let typeTuple = [1, 2];
/** @type {!Array<?>} */
let typeComplexTuple = ['', true];
/** @type {!Array<?>} */
let typeTupleTuple = [[1, 2]];
/** @type {!Array<?>} */
let typeTupleTuple2 = [[1, 2], ''];
/** @type {(string|boolean)} */
let typeUnion = Math.random() > 0.5 ? false : '';
/** @type {(string|boolean)} */
let typeUnion2 = Math.random() > 0.5 ? false : '';
/** @type {{optional: (undefined|boolean)}} */
let typeOptionalField = {};
/** @type {{optional: (undefined|string|boolean)}} */
let typeOptionalUnion = {};
/** @type {function(): void} */
let typeFunc = (/**
 * @return {void}
 */
function () { });
/** @type {function(number, ?): string} */
let typeFunc2 = (/**
 * @param {number} a
 * @param {?} b
 * @return {string}
 */
function (a, b) { return ''; });
/** @type {function(number, function(number): string): string} */
let typeFunc3 = (/**
 * @param {number} x
 * @param {function(number): string} cb
 * @return {string}
 */
function (x, cb) { return ''; });
/** @type {function(number, (undefined|*)=): string} */
let typeFuncOptionalArg;
/** @type {function(number, ...number): void} */
let typeFuncVarArgs;
/**
 * @param {function(number): number} callback
 * @return {void}
 */
function typeCallback(callback) { }
typeCallback((/**
 * @param {number} val
 * @return {number}
 */
val => val + 1));
/**
 * @template T
 * @param {function(T): T} callback
 * @return {void}
 */
function typeGenericCallback(callback) { }
typeGenericCallback((/**
 * @param {*} val
 * @return {*}
 */
val => val));
/** @typedef {function(new:?, number, *)} */
var ConstructorObj;
/** @typedef {function(new:?, ...*)} */
var ConstructorUnknown;
