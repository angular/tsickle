/**
 *
 * @fileoverview Reproduces a problem where TS implicitly defaults to public
 * visibility, whereas Closure Compiler implicitly inherits the parent's class
 * visibility, leading to a mismatch and warning generated in Closure Compiler
 * for code that compiles fine in TS.
 * Generated from: test_files/visibility/public_override.ts
 * @suppress {uselessCode}
 *
 */
goog.module('test_files.visibility.public_override');
var module = module || { id: 'test_files/visibility/public_override.ts' };
goog.require('tslib');
class A {
    constructor() {
        this.field = 'a';
    }
    /**
     * @protected
     * @return {string}
     */
    method() {
        return 'a';
    }
}
exports.A = A;
/* istanbul ignore if */
if (false) {
    /**
     * @type {string}
     * @protected
     */
    A.prototype.field;
}
/**
 * @extends {A}
 */
class B extends A {
    constructor() {
        super(...arguments);
        // The overridden field is implicitly public in TS, due to no modifier, but
        // would inherit protected visibility in JSCompiler by default.
        this.field = 'b';
    }
    /**
     * @public
     * @return {string}
     */
    method() {
        return 'a';
    }
}
exports.B = B;
/* istanbul ignore if */
if (false) {
    /**
     * @type {string}
     * @public
     */
    B.prototype.field;
}
