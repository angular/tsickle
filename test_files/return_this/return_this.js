/**
 * @fileoverview added by tsickle
 * Generated from: test_files/return_this/return_this.ts
 * @suppress {checkTypes,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.return_this.return_this');
var module = module || { id: 'test_files/return_this/return_this.ts' };
goog.require('tslib');
class UnrelatedClass {
    constructor() {
        this.a = 1;
    }
}
/* istanbul ignore if */
if (false) {
    /** @type {number} */
    UnrelatedClass.prototype.a;
}
class MethodsReturnThis {
    constructor() {
        this.b = 1;
    }
    /**
     * @template THIS
     * @this {THIS}
     * @return {THIS}
     */
    returnsThis() {
        return (/** @type {!MethodsReturnThis} */ (this));
    }
    /**
     * @template THIS
     * @this {THIS}
     * @return {THIS}
     */
    explicitThis() {
        return (/** @type {!MethodsReturnThis} */ (this));
    }
    /**
     * @template THIS,T
     * @this {THIS}
     * @param {T} t
     * @return {THIS}
     */
    templateAndThis(t) {
        return (/** @type {!MethodsReturnThis} */ (this));
    }
    // Ensures that access to `this` is cast to the precise type.
    /**
     * @template THIS
     * @this {THIS}
     * @return {THIS}
     */
    castsThisPropertyAccess() {
        (/** @type {!MethodsReturnThis} */ (this)).b = 2;
        return (/** @type {!MethodsReturnThis} */ (this));
    }
    // Ensures that nested access to a differently scoped `this` is not cast.
    /**
     * @template THIS
     * @this {THIS}
     * @return {THIS}
     */
    nestedDifferentThis() {
        /**
         * @this {!UnrelatedClass}
         * @return {void}
         */
        function differentThis() {
            this.a = 2;
        }
        class NestedClass {
            constructor() {
                this.c = 3;
            }
            /**
             * @return {void}
             */
            method() {
                this.c = 4;
            }
        }
        /* istanbul ignore if */
        if (false) {
            /** @type {number} */
            NestedClass.prototype.c;
        }
        return (/** @type {!MethodsReturnThis} */ (this));
    }
    // Ensures that arrow functions inherit the parent's `this` type.
    /**
     * @template THIS
     * @this {THIS}
     * @return {THIS}
     */
    nestedArrowThis() {
        /** @type {function(): void} */
        const sameThis = (/**
         * @return {void}
         */
        () => {
            (/** @type {!MethodsReturnThis} */ (this)).b = 1;
        });
        sameThis();
        return (/** @type {!MethodsReturnThis} */ (this));
    }
    /**
     * @template THIS,T
     * @this {THIS}
     * @param {T} t
     * @return {THIS}
     */
    overloadedThis(t) {
        return (/** @type {!MethodsReturnThis} */ (this));
    }
}
/* istanbul ignore if */
if (false) {
    /** @type {number} */
    MethodsReturnThis.prototype.b;
}
/**
 * @extends {MethodsReturnThis}
 */
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
