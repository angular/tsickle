/**
 * @fileoverview
 * @suppress {uselessCode}
 */

class HasMethods {
  _f: number;

  one() {}
  two(a: string): number {
    return 1;
  }

  get f(): number {
    return this._f + 1;
  }
  set f(n: number) {
    this._f = n - 1;
  }
}
