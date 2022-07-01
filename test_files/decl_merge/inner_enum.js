/**
 *
 * @fileoverview Ensure enums nested in a class, defined with declaration
 * merging are properly transformed and hoisted out of the namespace, and no
 * iife is created for the namespace.
 *
 * Generated from: test_files/decl_merge/inner_enum.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.decl_merge.inner_enum');
var module = module || { id: 'test_files/decl_merge/inner_enum.ts' };
goog.require('tslib');
class Outer {
    constructor() {
        this.e = Outer.Event.E_1;
    }
    /**
     * @public
     * @return {!Outer.Event}
     */
    foo() {
        return Outer.Event.E_0;
    }
}
exports.Outer = Outer;
/* istanbul ignore if */
if (false) {
    /**
     * @type {!Outer.Event}
     * @public
     */
    Outer.prototype.e;
}
/** @enum {number} */
const Outer$Event = {
    E_0: 0, E_1: 1,
};
Outer$Event[Outer$Event.E_0] = 'E_0';
Outer$Event[Outer$Event.E_1] = 'E_1';
/** @const */
Outer.Event = Outer$Event;
/**
 * @return {!Outer.Event}
 */
function e0() {
    return Outer.Event.E_0;
}
exports.e0 = e0;
