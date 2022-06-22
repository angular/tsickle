/**
 *
 * @fileoverview
 * Generated from: test_files/this_type/this_type.ts
 * @suppress {checkTypes,uselessCode}
 *
 */
goog.module('test_files.this_type.this_type');
var module = module || { id: 'test_files/this_type/this_type.ts' };
goog.require('tslib');
class SomeClass {
}
/* istanbul ignore if */
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
    // This (!) reproduces a situtation where tsickle would erroneously produce
    // an @THIS tag for the explicitly passed this type, plus one for the
    // template'd this type, which is an error in Closure.
    /**
     * @public
     * @this {!UnrelatedType}
     * @return {!ThisThisReturnsThisAsThis}
     */
    thisThisReturnsThisAsThis() {
        return (/** @type {!ThisThisReturnsThisAsThis} */ (this));
    }
}
