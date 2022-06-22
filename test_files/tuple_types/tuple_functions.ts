/**
 * @fileoverview Tests that destructured parameters get aliased into more
 * specific local variables.
 * @suppress {uselessCode}
 */

class Clazz {
  field = '';
  constructor([a, b]: [string, number]) {
    this.field = a + b;
  }

  destructuringMethod([a, b]: [string, number]) {
    return a + b;
  }

  set destructuringSetter([a, b]: [string, number]) {
    this.field = a + b;
  }
}

abstract class AbstractClazz {
  abstract abstractDestructuringMethod([a, b]: [string, number]): string;
}

function destructuringFunctionDeclaration([a, b]: [string, number]) {
  return a + b;
}
const destructuringFunctionExpression = function([a, b]: [string, number]) {
  return a + b;
};
const destructuringArrow = ([a, b]: [string, number]) => {
  return a + b;
};
const destructuringArrowComment = ([a, b]: [string, number]) =>
    // with a comment
    a + b;

export {};
