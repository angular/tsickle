// test_files/type/type.ts(3,1): warning TS0: type/symbol conflict for Array, using {?} for now
// test_files/type/type.ts(14,5): warning TS0: unhandled anonymous type
// test_files/type/type.ts(44,5): warning TS0: Skipping class entry MyRecord in intersection type
// test_files/type/type.ts(45,5): warning TS0: Skipping non-object entry in intersection type: {type flags:0x4 Number}
// test_files/type/type.ts(46,5): warning TS0: Skipping non-object entry in intersection type: {type flags:0x2 String}
// test_files/type/type.ts(46,5): warning TS0: Skipping non-object entry in intersection type: {type flags:0x4 Number}
// test_files/type/type.ts(47,5): warning TS0: Skipping class entry Date in intersection type
// test_files/type/type.ts(48,5): warning TS0: unhandled anonymous type with multiple call signatures
// test_files/type/type.ts(48,5): warning TS0: unhandled anonymous type with multiple call signatures
// test_files/type/type.ts(48,5): warning TS0: unhandled anonymous type with multiple call signatures
// test_files/type/type.ts(48,5): warning TS0: unhandled anonymous type with multiple call signatures
// test_files/type/type.ts(48,5): warning TS0: unhandled anonymous type with multiple call signatures
// test_files/type/type.ts(48,5): warning TS0: unhandled anonymous type with multiple call signatures
// test_files/type/type.ts(48,5): warning TS0: omitting inexpressible property name: __@iterator
// test_files/type/type.ts(48,5): warning TS0: omitting inexpressible property name: __@unscopables
// test_files/type/type.ts(48,5): warning TS0: unhandled anonymous type
// test_files/type/type.ts(49,5): warning TS0: unhandled anonymous type
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
// WARNING: interface has both a type and a value, skipping emit
goog.module('test_files.type.type');
var module = module || { id: 'test_files/type/type.ts' };
module = module;
exports = {};
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
/**
 * @record
 */
function MyRecord() { }
if (false) {
    /** @type {string} */
    MyRecord.prototype.b;
}
/** @type {{a: number, b: string}} */
const typeIntersectionOfObjectTypes = { a: 42, b: 'b' };
/** @type {{a: number}} */
let typeIntersectionWithRecordInterface = { a: 42, b: 'b' };
/** @type {{a: number}} */
let typeIntersectionMixed1;
/** @type {?} */
let typeIntersectionMixed2;
/** @type {{a: number}} */
let typeIntersectionMixed3;
/** @type {?} */
let typeIntersectionMixed4;
/** @type {?} */
let typeIntersectionMixed5 = Object.assign(() => 1, { a: 1 });
