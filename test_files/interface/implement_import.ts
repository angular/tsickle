import {Point, User} from './interface';

class MyPoint implements Point {
  constructor(public x: number, public y: number) {}
}

class ImplementsUser implements User {
  constructor(public shoeSize: number) {}
}

class ExtendsUser extends User {
  constructor() {
    super();
  }
}
