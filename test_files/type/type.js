goog.module('test_files.type.type');var module = module || {id: 'test_files/type/type.js'};/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes}
 */
let /** @type {?} */ typeAny;
let /** @type {!Array<?>} */ typeArr;
let /** @type {!Array<?>} */ typeArr2;
let /** @type {!Array<!Array<{a: ?}>>} */ typeNestedArr;
let /** @type {{a: number, b: string}} */ typeObject = { a: 3, b: 'b' };
let /** @type {!Object<string,number>} */ typeObject2;
let /** @type {?} */ typeObject3;
let /** @type {?} */ typeObjectEmpty;
let /** @type {!Array<?>} */ typeTuple = [1, 2];
let /** @type {!Array<?>} */ typeComplexTuple = ['', true];
let /** @type {!Array<?>} */ typeTupleTuple = [[1, 2]];
let /** @type {!Array<?>} */ typeTupleTuple2 = [[1, 2], ''];
let /** @type {(string|boolean)} */ typeUnion = Math.random() > 0.5 ? false : '';
let /** @type {(string|boolean)} */ typeUnion2 = Math.random() > 0.5 ? false : '';
let /** @type {{optional: (undefined|boolean)}} */ typeOptionalField = {};
let /** @type {{optional: (undefined|string|boolean)}} */ typeOptionalUnion = {};
let /** @type {function(): void} */ typeFunc = function () { };
let /** @type {function(number, ?): string} */ typeFunc2 = function (a, b) { return ''; };
let /** @type {function(number, function(number): string): string} */ typeFunc3 = function (x, cb) { return ''; };
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
