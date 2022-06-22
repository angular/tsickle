/**
 * @fileoverview Reproduces a problem where TS implicitly defaults to public
 * visibility, whereas Closure Compiler implicitly inherits the parent's class
 * visibility, leading to a mismatch and warning generated in Closure Compiler
 * for code that compiles fine in TS.
 * @suppress {uselessCode}
 */

export class A {
  protected field: string = 'a';
  protected method() {
    return 'a';
  }
}

export class B extends A {
  // The overridden field is implicitly public in TS, due to no modifier, but
  // would inherit protected visibility in JSCompiler by default.
  field: string = 'b';
  method() {
    return 'a';
  }
}
