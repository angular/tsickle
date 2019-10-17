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
  b: 2,
};

function foo():any{}
// Comma expressions with more than 10 elements get represented in the
// TypeScript AST as a unique CommaListExpression node, so we need an export
// with at least 10 names in order to cover that case in tsickle.
export const {A, B, C, D, E, F, G, H, I, J} = foo();
