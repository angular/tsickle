goog.module('test_files.optional_chaining.optional_chaining');
var module = module || { id: 'test_files/optional_chaining/optional_chaining.ts' };
goog.require('tslib');
var _a, _b, _c;
/**
 *
 * @fileoverview Tests that tsickle handles non-nullable assertions in optional
 * chains correctly. The correct behavior is not emitting any special casts
 * because Closure Compiler will not check possibly-undefined property access.
 * If we did want to add a cast for maximum type correctness, it would require
 * adding parentheses, which would change the semantics of the optional chain.
 * For more information see jsdoc_transformer.ts.
 * Generated from: test_files/optional_chaining/optional_chaining.ts
 * @suppress {checkTypes}
 *
 */
/** @type {(undefined|{a: (undefined|{b: number})})} */
let basic;
/** @type {(undefined|number)} */
let basic1 = basic === null || basic === void 0 ? void 0 : basic.a.b;
/** @type {(undefined|{a: {b: (undefined|{c: number})}})} */
let deep;
/** @type {(undefined|number)} */
let deep1 = deep === null || deep === void 0 ? void 0 : deep.a.b.c;
/** @type {number} */
let deep2 = (_b = (_a = deep === null || deep === void 0 ? void 0 : deep.a) === null || _a === void 0 ? void 0 : _a.b) === null || _b === void 0 ? void 0 : _b.c;
/** @type {(undefined|{a: (undefined|{b: (undefined|{c: number})})})} */
let nested;
/** @type {number} */
let nested1 = nested === null || nested === void 0 ? void 0 : nested.a.b.c;
/**
 * @param {number} n
 * @return {void}
 */
function f1(n) { }
f1(nested === null || nested === void 0 ? void 0 : nested.a.b.c);
/** @type {(undefined|{a: (undefined|{b: (undefined|!Array<{c: (undefined|number)}>)})})} */
let hasArray;
/** @type {number} */
let hasArray1 = hasArray === null || hasArray === void 0 ? void 0 : hasArray.a.b[0].c;
/** @type {(undefined|{a: function(): (undefined|{b: number})})} */
let hasFn;
/** @type {(undefined|number)} */
let hasFn1 = hasFn === null || hasFn === void 0 ? void 0 : hasFn.a().b;
/** @type {(undefined|{a: (undefined|function(): (undefined|{b: number}))})} */
let hasOptionalFn;
/** @type {(undefined|number)} */
let hasOptionalFn1 = (_c = hasOptionalFn === null || hasOptionalFn === void 0 ? void 0 : hasOptionalFn.a) === null || _c === void 0 ? void 0 : _c.call(hasOptionalFn).b;
/**
 * @param {?} a
 * @return {?}
 */
function f(a) {
    var _a;
    return (_a = a.b()) === null || _a === void 0 ? void 0 : _a.d()[0].f().e()[0];
}
/**
 * @param {?} a
 * @return {?}
 */
function f2(a) {
    return a === null || a === void 0 ? void 0 : a().x.y.z;
}
