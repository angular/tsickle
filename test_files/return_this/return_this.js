/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
goog.module('test_files.return_this.return_this');
var module = module || { id: 'test_files/return_this/return_this.ts' };
module = module;
exports = {};
class MethodsReturnThis {
    /**
     * @template THIS
     * @this {THIS}
     * @return {THIS}
     */
    returnsThis() {
        return this;
    }
    /**
     * @template THIS
     * @this {THIS}
     * @return {THIS}
     */
    explicitThis() {
        return this;
    }
    /**
     * @template THIS,T
     * @this {THIS}
     * @param {T} t
     * @return {THIS}
     */
    templateAndThis(t) {
        return this;
    }
    /**
    /**
     * @template THIS,T
     * @this {THIS}
     * @param {T} t
     * @return {THIS}
     */
    overloadedThis(t) {
        return this;
    }
}
class SubclassReturnsThis extends MethodsReturnThis {
    /**
     * @template THIS
     * @this {THIS}
     * @return {THIS}
     */
    returnsThis() {
        return super.returnsThis();
    }
}
