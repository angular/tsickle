// test_files/partial/partial.ts(7,1): warning TS0: dropped implements: dropped implements of a type literal: Partial<Base>
/**
 * @fileoverview added by tsickle
 * Generated from: test_files/partial/partial.ts
 * @suppress {checkTypes,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.partial.partial');
var module = module || { id: 'test_files/partial/partial.ts' };
goog.require('tslib');
/**
 * @record
 */
function Base() { }
/* istanbul ignore if */
if (false) {
    /** @type {string} */
    Base.prototype.foo;
}
/**
 * tsickle: dropped implements: dropped implements of a type literal: Partial<Base>
 */
class Derived {
    /**
     * @return {void}
     */
    useFoo() {
        this.foo = undefined;
    }
}
/* istanbul ignore if */
if (false) {
    /** @type {(undefined|string)} */
    Derived.prototype.foo;
}
