/**
 * @fileoverview A class indirectly extending a class with constructor.
 */

declare namespace foo {
  abstract class Base {
    constructor(s: string);
  }
  abstract class BaseChild extends Base {}

  class Child extends Base {}
}
