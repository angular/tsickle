/**
 *
 * @fileoverview only_types only exports types, so TypeScript will elide the
 * import entirely.
 *
 * @suppress {checkTypes,extraRequire} checked by tsc
 */
goog.module('test_files.decorator.only_types');
var module = module || { id: 'test_files/decorator/only_types.ts' };
/**
 * @record
 */
function AnotherType() { }
exports.AnotherType = AnotherType;
function AnotherType_tsickle_Closure_declarations() {
    /** @type {string} */
    AnotherType.prototype.field;
}
