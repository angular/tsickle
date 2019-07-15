/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.symbol.symbol');
var module = module || { id: 'test_files/symbol/symbol.ts' };
module = module;
exports = {};
/** @type {symbol} */
const uniqueSymbol = Symbol('my symbol');
/**
 * @param {symbol} symbolTyped
 * @return {void}
 */
function usingSymbol(symbolTyped) {
    console.log(symbolTyped);
}
/**
 * @record
 */
function ComputedSymbol() { }
if (false) {
    /**
     * @return {number}
     */
    ComputedSymbol.prototype[uniqueSymbol] = function () { };
}
usingSymbol(uniqueSymbol);
