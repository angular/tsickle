/**
 * @fileoverview
 * @suppress {uselessCode}
 */
const uniqueSymbol: unique symbol = Symbol('my symbol');

function usingSymbol(symbolTyped: symbol) {
  console.log(symbolTyped);
}

interface ComputedSymbol {
  [uniqueSymbol](): number;
}

usingSymbol(uniqueSymbol);
