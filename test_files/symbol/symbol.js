// test_files/symbol/symbol.ts(1,1): warning TS0: file comments must be at the top of the file, separated from the file body by an empty line.
/**
 * @fileoverview added by tsickle
 * Generated from: test_files/symbol/symbol.ts
 */
goog.module('test_files.symbol.symbol');
var module = module || { id: 'test_files/symbol/symbol.ts' };
goog.require('tslib');
/**
 * @fileoverview
 * @suppress {uselessCode}
 * @type {symbol}
 */
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
     * @public
     * @return {number}
     */
    ComputedSymbol.prototype[uniqueSymbol] = function () { };
}
usingSymbol(uniqueSymbol);
