// test_files/partial/partial.ts(12,1): warning TS0: dropped implements: dropped implements of a type literal: Partial<Base>
/**
 *
 * @fileoverview
 * Generated from: test_files/partial/partial.ts
 * @suppress {uselessCode}
 *
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
    /**
     * @type {string}
     * @public
     */
    Base.prototype.foo;
}
/**
 * tsickle: dropped implements: dropped implements of a type literal: Partial<Base>
 */
class Derived {
    /**
     * @public
     * @return {void}
     */
    useFoo() {
        this.foo = undefined;
    }
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {(undefined|string)}
     * @public
     */
    Derived.prototype.foo;
}
