/**
 * @fileoverview Some export forms that create multi-expression 'export'
 * statements, which are illegal under Closure and must be rewritten.
 */

enum Fruit {
  APPLE = 'apple',
  PEAR = 'pear',
  ORANGE = 'orange'
}

export const {
  APPLE,
  PEAR,
  ORANGE,
} = Fruit;

export const {a, b, c, d, e, f, g, h, i, j} = {
  a: 1,
  b: 2,
  c: 3,
  d: 4,
  e: 5,
  f: 6,
  g: 7,
  h: 8,
  i: 9,
  j: 10
};
