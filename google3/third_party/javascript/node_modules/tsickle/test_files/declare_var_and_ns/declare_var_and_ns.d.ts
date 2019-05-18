/** @fileoverview Tests declaring a global variable and a matching (conflicting) namespace. */

declare var globalVariable: globalVariable.SomeInterface;

// tsickle avoids emitting another initializer (`= {}`) if the symbol has been declared earlier.
// However variables specifically are not initialized to a value, so this must still emit an
// initializer for the namespace.
declare namespace globalVariable {
  interface SomeInterface {}
}
