/**
 * @fileoverview Reproduces a problem where tsickle would emit "\@extends
 * {ClassInImplements}", conflicting the ES6 extends syntax, leading to
 * incorrect optimization results.
 * @suppress {uselessCode}
 */

class ClassInImplements {
  foo: string|undefined;
}
class ClassInExtends {
  bar() {
    return 'a';
  }
}
class ExtendsAndImplementsClass extends ClassInExtends implements
    ClassInImplements {
  foo: string;
}
