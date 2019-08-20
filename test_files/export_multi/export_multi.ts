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

export const {a, b} = {
  a: 1,
  b: 2
};
