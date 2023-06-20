goog.module('test_files.async_functions.async_functions');
var module = module || { id: 'test_files/async_functions/async_functions.ts' };
const tslib_1 = goog.require('tslib');
/**
 *
 * @fileoverview
 * Exercises various forms of async functions.  When TypeScript downlevels these
 * functions, it inserts a reference to 'this' which then tickles a Closure
 * check around whether 'this' has a known type.
 * Generated from: test_files/async_functions/async_functions.ts
 * @suppress {uselessCode}
 *
 */
/**
 * @param {string} param
 * @return {!Promise<string>}
 * @this {*}
 */
function asyncTopLevelFunction(param) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        /** @type {string} */
        const s = yield 'a';
        return s;
    });
}
exports.asyncTopLevelFunction = asyncTopLevelFunction;
/**
 * @this {!Container}
 * @param {string} param
 * @return {!Promise<number>}
 */
function asyncTopLevelFunctionWithThisType(param) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        /** @type {number} */
        const s = yield 3;
        return s;
    });
}
exports.asyncTopLevelFunctionWithThisType = asyncTopLevelFunctionWithThisType;
/** @type {function(string): !Promise<number>} */
const asyncTopLevelArrowFunction = (/**
 * @param {string} param
 * @return {!Promise<number>}
 */
(param) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    /** @type {number} */
    const s = yield 3;
    return s;
}));
class Container {
    constructor() {
        this.field = 'y';
    }
    /**
     * @public
     * @return {!Promise<string>}
     */
    asyncMethod() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            /** @type {string} */
            const s = yield asyncTopLevelFunction('x');
            return s;
        });
    }
    /**
     * @public
     * @return {void}
     */
    containerMethod() {
        /** @type {function(string): !Promise<number>} */
        const asyncArrowFunctionInMethod = (/**
         * @param {string} param
         * @return {!Promise<number>}
         */
        (param) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            /** @type {number} */
            const s = yield 3;
            return s;
        }));
        /**
         * @param {string} param
         * @return {!Promise<number>}
         * @this {*}
         */
        function asyncFunctionInMethod(param) {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                /** @type {number} */
                const s = yield 3;
                return s;
            });
        }
    }
    /**
     * @public
     * @return {!Promise<string>}
     */
    static asyncStaticMethod() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            /** @type {string} */
            const s = yield asyncTopLevelFunction('x');
            return s + this.staticField;
        });
    }
}
Container.staticField = 's';
/* istanbul ignore if */
if (false) {
    /**
     * @type {string}
     * @public
     */
    Container.staticField;
    /**
     * @type {string}
     * @public
     */
    Container.prototype.field;
}
// TODO(#1099): uncomment this test after the async emit is fixed.
// const asyncFnExpression = async function f() {};
/** @type {function(): !Promise<void>} */
const asyncArrowFn = (/**
 * @return {!Promise<void>}
 */
() => tslib_1.__awaiter(void 0, void 0, void 0, function* () { }));
/** @type {function(): !Promise<void>} */
exports.exportedAsyncArrowFn = (/**
 * @return {!Promise<void>}
 */
() => tslib_1.__awaiter(void 0, void 0, void 0, function* () { }));
/**
 * @return {function(): !Promise<number>}
 * @this {*}
 */
function toplevelContainingAsync() {
    return (/**
     * @return {!Promise<number>}
     */
    () => tslib_1.__awaiter(this, void 0, void 0, function* () { return 3; }));
}
exports.toplevelContainingAsync = toplevelContainingAsync;
/**
 * @this {string}
 * @return {function(): !Promise<number>}
 */
function toplevelWithThisType() {
    return (/**
     * @return {!Promise<number>}
     */
    () => tslib_1.__awaiter(this, void 0, void 0, function* () { return 3; }));
}
exports.toplevelWithThisType = toplevelWithThisType;
