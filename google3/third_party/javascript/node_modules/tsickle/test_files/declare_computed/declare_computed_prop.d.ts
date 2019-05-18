declare interface Type {
  // Supported by JSCompiler.
  [Symbol.iterator](): Iterator<string>;
  // Not really supported by JSCompiler, mostly making sure this does not cause
  // a syntax error.
  ['computedMethod'](): number;
  // Not supported, only emitted as a TODO.
  ['computedProp']: number;
}
