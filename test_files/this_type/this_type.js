/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
goog.module('test_files.this_type.this_type');
var module = module || { id: 'test_files/this_type/this_type.ts' };
module = module;
exports = {};
class SomeClass {
}
if (false) {
    /** @type {number} */
    SomeClass.prototype.x;
}
/** @type {function(this: (!SomeClass), string): number} */
const variableWithFunctionTypeUsingThis = () => 1;
// Has only a single this arg, no more parameters.
/**
 * @return {(undefined|function(this: (string)): string)}
 */
function foo() {
    return undefined;
}
