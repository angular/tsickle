const uniqueSymbol = Symbol('my symbol');

function usingSymbol(symbolTyped: symbol) {
  console.log(symbolTyped);
}

usingSymbol(uniqueSymbol);
