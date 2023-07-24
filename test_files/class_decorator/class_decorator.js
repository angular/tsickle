goog.module('test_files.class_decorator.class_decorator');
var module = module || { id: 'test_files/class_decorator/class_decorator.ts' };
const tslib_1 = goog.require('tslib');
/**
 *
 * @fileoverview Ensure the JsDoc comments on the generated JS calls to
 * tslib_1.__decorate() do not contain template annotations.
 *
 * Template and abstract annotations of decorated class declarations get cloned
 * to the generated __decorate() call which makes the JSCompiler unhappy. This
 * test ensures that those annotations are removed from the JSDoc comments of
 * __decorate() calls.
 *
 * Generated from: test_files/class_decorator/class_decorator.ts
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
/**
 * Non-synthetic comment
 */
ClassyBar = tslib_1.__decorate([
    classyClass
], ClassyBar);
/**
 * @abstract
 */
let AbstractBar = /**
 * @abstract
 */
class AbstractBar {
};
AbstractBar = tslib_1.__decorate([
    classyClass
], AbstractBar);
/**
 * Ensure other annotations are preserved, e.g. the suppress annotation.
 * \@soyCompatible
 * @final
 * @suppress {visibility}
 * @template T
 * @extends {ClassyBar<T>}
 */
let AnotherClassyBar = /**
 * Ensure other annotations are preserved, e.g. the suppress annotation.
 * \@soyCompatible
 * @final
 * @suppress {visibility}
 * @template T
 * @extends {ClassyBar<T>}
 */
class AnotherClassyBar extends ClassyBar {
};
/**
 * Ensure other annotations are preserved, e.g. the suppress annotation.
 * \\@soyCompatible
 * @final
 * @suppress {visibility}
 */
AnotherClassyBar = tslib_1.__decorate([
    classyClass
], AnotherClassyBar);
exports.AnotherClassyBar = AnotherClassyBar;
exports.AnotherClassyBarUnderAnotherName = AnotherClassyBar;
