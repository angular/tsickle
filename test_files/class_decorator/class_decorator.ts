/**
 * @fileoverview Ensure the JsDoc comments on the generated JS calls to
 * tslib_1.__decorate() do not contain template annotations.
 *
 * Template and abstract annotations of decorated class declarations get cloned
 * to the generated __decorate() call which makes the JSCompiler unhappy. This
 * test ensures that those annotations are removed from the JSDoc comments of
 * __decorate() calls.
 */

export {};

function classyClass(t: any) {
  return t;
}

@classyClass
class ClassyFoo<T> {
}

/** Non-synthetic comment */
@classyClass
class ClassyBar<T> {
}

@classyClass
abstract class AbstractBar {
}

/**
 * Ensure other annotations are preserved, e.g. the suppress annotation.
 * @soyCompatible
 * @final
 * @suppress {visibility}
 */
@classyClass
export class AnotherClassyBar<T> extends ClassyBar<T> {
}

export {AnotherClassyBar as AnotherClassyBarUnderAnotherName};
