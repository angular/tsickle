/**
 * @fileoverview Tests template parameters for generic classes nested inside
 * another generic class.
 */

class Outer<T> {
  outer() {
    class Inner<P> {
      inner() {
        class VeryDeep<O> {}
        const deep = new VeryDeep<boolean>();
      }
    }
    const inner = new Inner<number>();
  }
}
