goog.module('test_files.decorator.class_decorator');
var module = module || { id: 'test_files/decorator/class_decorator.ts' };
const tslib_1 = goog.require('tslib');
/**
 *
 * @fileoverview Ensure the JsDoc comments on the generated JS calls to
 * tslib_1.__decorate() are suppressed.
 *
 * In particular templates are problematic because the template annotation
 * of the class declaration gets cloned to the generated __decorate() call
 * which makes the JSCompiler unhappy. This test ensures the JSDoc comment
 * is removed from the call.
 *
 * Generated from: test_files/decorator/class_decorator.ts
 * @suppress {checkTypes,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @param {?} t
 * @return {?}
 */
function classyClass(t) {
    return t;
}
/**
 * @template T
 */
let ClassyFoo = /**
 * @template T
 */
class ClassyFoo {
};
ClassyFoo = tslib_1.__decorate([
    classyClass
], ClassyFoo);
/**
 * Non-synthetic comment
 * @template T
 */
let ClassyBar = /**
 * Non-synthetic comment
 * @template T
 */
class ClassyBar {
};
ClassyBar = tslib_1.__decorate([
    classyClass
], ClassyBar);
