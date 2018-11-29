// test_files/partial/partial.ts(7,1): warning TS0: omitting heritage reference to a type literal: Partial<Base>
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('test_files.partial.partial');
var module = module || { id: 'test_files/partial/partial.ts' };
module = module;
exports = {};
/**
 * @record
 */
function Base() { }
if (false) {
    /** @type {string} */
    Base.prototype.foo;
}
class Derived {
    /**
     * @return {void}
     */
    useFoo() {
        this.foo = undefined;
    }
}
if (false) {
    /** @type {(undefined|string)} */
    Derived.prototype.foo;
}
