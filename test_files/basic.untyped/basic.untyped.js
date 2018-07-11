/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
goog.module('test_files.basic.untyped.basic.untyped');
var module = module || { id: 'test_files/basic.untyped/basic.untyped.ts' };
module = module;
exports = {};
/**
 * @param {?} arg1
 * @return {?}
 */
function func(arg1) {
    return [3];
}
class Foo {
    /**
     * @param {?} ctorArg
     */
    constructor(ctorArg) {
        this.ctorArg = ctorArg;
        this.field = 'hello';
    }
}
if (false) {
    /** @type {?} */
    Foo.prototype.field;
    /** @type {?} */
    Foo.prototype.ctorArg;
}
// These two declarations should not have a @type annotation,
// regardless of untyped.
(function () {
    let { a, b } = { a: '', b: 0 };
})();
(function () {
    let { a, b } = { a: null, b: null };
})();
