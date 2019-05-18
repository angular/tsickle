import DefaultSymbol from './exporter';

// Make sure that regular TypeScript default imports are emitted as a .default
// property on the module symbol.
console.log(new DefaultSymbol());
