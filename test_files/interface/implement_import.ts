/**
 * @fileoverview
 * @suppress {uselessCode}
 */

import {Point, User} from './interface';

class MyPoint implements Point {
  constructor(public x: number, public y: number) {}
}

class ImplementsUser implements User {
  constructor(public shoeSize: number) {}
}

// Note that the @extends JSDoc points to a different name than the extends
// clause. Closure Compiler allows this as long as they both eventually resolve
// to the same type.
class ExtendsUser extends User {
  constructor() {
    super();
  }
}
