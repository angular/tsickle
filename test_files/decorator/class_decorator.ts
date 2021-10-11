/**
 * @fileoverview Ensure the JsDoc comments on the generated JS calls to
 * tslib_1.__decorate() are suppressed.
 *
 * In particular templates are problematic because the template annotation
 * of the class declaration gets cloned to the generated __decorate() call
 * which makes the JSCompiler unhappy. This test ensures the JSDoc comment
 * is removed from the call.
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
