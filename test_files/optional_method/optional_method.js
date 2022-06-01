/**
 *
 * @fileoverview
 * Generated from: test_files/optional_method/optional_method.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.optional_method.optional_method');
var module = module || { id: 'test_files/optional_method/optional_method.ts' };
goog.require('tslib');
// This test ensures that we generate declarations for optional methods (note
// the ?). Optional methods need special treatment, as they map to property
// declarations in Closure Compiler.
class OptionalMethod {
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {(undefined|function(): void)}
     * @public
     */
    OptionalMethod.staticOptionalMethod;
    /**
     * @type {(undefined|function(): void)}
     * @public
     */
    OptionalMethod.prototype.optionalMethod;
}
// For comparison, these should generate the same type signatures as the
// following declarations.
class OptionalArrowFnProperty {
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {(undefined|function(): void)}
     * @public
     */
    OptionalArrowFnProperty.staticArrowFnProperty;
    /**
     * @type {(undefined|function(): void)}
     * @public
     */
    OptionalArrowFnProperty.prototype.arrowFnProperty;
}
