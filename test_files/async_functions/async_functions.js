/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.async_functions.async_functions');
var module = module || { id: 'test_files/async_functions/async_functions.ts' };
module = module;
exports = {};
const tslib_1 = goog.require('tslib');
/**
 * @param {string} param
 * @return {!Promise<string>}
 * @this {*}
 */
function asyncTopLevelFunction(param) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        /** @type {!Promise<string>} */
        const p = new Promise((/**
         * @param {function((undefined|string|!PromiseLike<string>)=): void} res
         * @param {function(?=): void} rej
         * @return {void}
         */
        (res, rej) => {
            res(param);
        }));
        /** @type {string} */
        const s = yield p;
        return s;
    });
}
/**
 * @this {!Container}
 * @param {string} param
 * @return {!Promise<string>}
 */
function asyncTopLevelFunctionWithThisType(param) {
    return tslib_1.__awaiter(this, void 0, void 0, /** @this {!Container} */ function* () {
        /** @type {!Promise<string>} */
        const p = new Promise((/**
         * @param {function((undefined|string|!PromiseLike<string>)=): void} res
         * @param {function(?=): void} rej
         * @return {void}
         */
        (res, rej) => {
            res(param);
        }));
        /** @type {string} */
        const s = yield p;
        return s + this.field;
    });
}
/** @type {function(string): !Promise<string>} */
const asyncTopLevelArrowFunction = (/**
 * @param {string} param
 * @return {!Promise<string>}
 */
(param) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    /** @type {!Promise<string>} */
    const p = new Promise((/**
     * @param {function((undefined|string|!PromiseLike<string>)=): void} res
     * @param {function(?=): void} rej
     * @return {void}
     */
    (res, rej) => {
        res(param);
    }));
    /** @type {string} */
    const s = yield p;
    return s + this.field;
}));
class Container {
    constructor() {
        this.field = 'y';
    }
    /**
     * @return {!Promise<string>}
     */
    asyncMethod() {
        return tslib_1.__awaiter(this, void 0, void 0, /** @this {!Container} */ function* () {
            /** @type {string} */
            const s = yield asyncTopLevelFunction('x');
            return s + this.field;
        });
    }
    /**
     * @return {void}
     */
    containerMethod() {
        /** @type {function(string): !Promise<string>} */
        const asyncArrowFunctionInMethod = (/**
         * @param {string} param
         * @return {!Promise<string>}
         */
        (param) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            /** @type {!Promise<string>} */
            const p = new Promise((/**
             * @param {function((undefined|string|!PromiseLike<string>)=): void} res
             * @param {function(?=): void} rej
             * @return {void}
             */
            (res, rej) => {
                res(param);
            }));
            /** @type {string} */
            const s = yield p;
            return s + this.field;
        }));
        /**
         * @param {string} param
         * @return {!Promise<string>}
         * @this {*}
         */
        function asyncFunctionInMethod(param) {
            return tslib_1.__awaiter(this, void 0, void 0, /** @this {!Container} */ function* () {
                /** @type {!Promise<string>} */
                const p = new Promise((/**
                 * @param {function((undefined|string|!PromiseLike<string>)=): void} res
                 * @param {function(?=): void} rej
                 * @return {void}
                 */
                (res, rej) => {
                    res(param);
                }));
                /** @type {string} */
                const s = yield p;
                return s + this.field;
            });
        }
    }
}
if (false) {
    /** @type {string} */
    Container.prototype.field;
}
