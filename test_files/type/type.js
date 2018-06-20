// test_files/type/type.ts(14,5): warning TS0: unhandled anonymous type
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire} checked by tsc
 */
goog.module('test_files.type.type');
var module = module || { id: 'test_files/type/type.ts' };
/** @type {?} */
let typeAny;
/** @type {!Array<?>} */
let typeArr;
/** @type {!Array<?>} */
let typeArr2;
/** @type {!Array<!Array<{a: ?}>>} */
let typeNestedArr;
/** @type {{a: number, b: string}} */
let typeObject = { a: 3, b: 'b' };
/** @type {!Object<string,number>} */
let typeObjectIndexable;
/** @type {?} */
let typeObjectMixedIndexProperty;
/** @type {!Object} */
let typeObjectEmpty;
/** @type {!Object} */
let typeNonPrimitive;
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
let typeFunc = function () { };
/** @type {function(number, ?): string} */
let typeFunc2 = function (a, b) { return ''; };
/** @type {function(number, function(number): string): string} */
let typeFunc3 = function (x, cb) { return ''; };
/** @type {function(number, (undefined|!Object)=): string} */
let typeFuncOptionalArg;
/** @type {function(number, ...number): void} */
let typeFuncVarArgs;
/**
 * @param {function(number): number} callback
 * @return {void}
 */
function typeCallback(callback) { }
typeCallback(val => val + 1);
/**
 * @template T
 * @param {function(T): T} callback
 * @return {void}
 */
function typeGenericCallback(callback) { }
typeGenericCallback(val => val);
