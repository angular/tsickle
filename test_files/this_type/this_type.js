/**
 * @fileoverview added by tsickle
 * Generated from: test_files/this_type/this_type.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.this_type.this_type');
var module = module || { id: 'test_files/this_type/this_type.ts' };
module = module;
exports = {};
class SomeClass {
}
if (false) {
    /**
     * @type {number}
     * @private
     */
    SomeClass.prototype.x;
}
/** @type {function(this: (!SomeClass), string): number} */
const variableWithFunctionTypeUsingThis = (/**
 * @return {number}
 */
() => 1);
// Has only a single this arg, no more parameters.
/**
 * @return {(undefined|function(this: (string)): string)}
 */
function foo() {
    return undefined;
}
class UnrelatedType {
}
class ThisThisReturnsThisAsThis {
    // This (!) reproduces a situtation where tsickle would erroneously produce an @THIS tag for the
    // explicitly passed this type, plus one for the template'd this type, which is an error in
    // Closure.
    /**
     * @this {!UnrelatedType}
     * @return {!ThisThisReturnsThisAsThis}
     */
    thisThisReturnsThisAsThis() {
        return (/** @type {!ThisThisReturnsThisAsThis} */ (this));
    }
}
