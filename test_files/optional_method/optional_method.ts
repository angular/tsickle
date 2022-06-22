/**
 * @fileoverview
 * @suppress {uselessCode}
 */

export {};

// This test ensures that we generate declarations for optional methods (note
// the ?). Optional methods need special treatment, as they map to property
// declarations in Closure Compiler.
class OptionalMethod {
  optionalMethod?(): void;
  static staticOptionalMethod?(): void;
}

// For comparison, these should generate the same type signatures as the
// following declarations.
class OptionalArrowFnProperty {
  arrowFnProperty?: () => void;
  static staticArrowFnProperty?(): void;
}
