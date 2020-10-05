/**
 * @fileoverview added by tsickle
 * Generated from: test_files/symbol/symbol.ts
 * @suppress {checkTypes,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.symbol.symbol');
var module = module || { id: 'test_files/symbol/symbol.ts' };
goog.require('tslib');
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
/* istanbul ignore if */
if (false) {
    /**
     * @return {number}
     */
    ComputedSymbol.prototype[uniqueSymbol] = function () { };
}
usingSymbol(uniqueSymbol);
