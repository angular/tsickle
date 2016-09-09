class HasMethods {
  _f: number;
/**
 * @return {void}
 */
one() {}
/**
 * @param {string} a
 * @return {number}
 */
two(a: string): number { return 1; }
/**
 * @return {number}
 */
get f(): number { return this._f + 1; }
/**
 * @param {number} n
 * @return {void}
 */
set f(n: number) { this._f = n - 1; }

  static _tsickle_typeAnnotationsHelper() {
 /** @type {number} */
HasMethods.prototype._f;
  }

}
